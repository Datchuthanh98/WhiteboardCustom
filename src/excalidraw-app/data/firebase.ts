import { ExcalidrawElement, FileId } from "../../element/types";
import {
  BinaryFileData,
  BinaryFileMetadata,
  DataURL,
} from "../../types";
import { FILE_CACHE_MAX_AGE_SEC } from "../app_constants";
import { decompressData } from "../../data/encode";
import { MIME_TYPES } from "../../constants";

// private
// -----------------------------------------------------------------------------

let FIREBASE_CONFIG: Record<string, any>;
try {
  FIREBASE_CONFIG = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
} catch (error: any) {
  console.warn(
    `Error JSON parsing firebase config. Supplied value: ${process.env.REACT_APP_FIREBASE_CONFIG}`,
  );
  FIREBASE_CONFIG = {};
}

let firebasePromise: Promise<typeof import("firebase/app").default> | null =
  null;
let firebaseStoragePromise: Promise<any> | null | true = null;

let isFirebaseInitialized = false;

const _loadFirebase = async () => {

  const firebase = (
    await import(/* webpackChunkName: "firebase" */ "firebase/app")
  ).default;

  if (!isFirebaseInitialized) {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
    } catch (error: any) {
      // trying initialize again throws. Usually this is harmless, and happens
      // mainly in dev (HMR)
      if (error.code === "app/duplicate-app") {
        console.warn(error.name, error.code);
      } else {
        throw error;
      }
    }
    isFirebaseInitialized = true;
  }
  // console.log("_loadFirebase", firebase)
  return firebase;
};

const _getFirebase = async (): Promise<
  typeof import("firebase/app").default
> => {

  if (!firebasePromise) {
    firebasePromise = _loadFirebase();
  }
  // console.log("_getFirebase", firebasePromise)

  return firebasePromise;
};

// -----------------------------------------------------------------------------


export const loadFirebaseStorage = async () => {

  const firebase = await _getFirebase();
  if (!firebaseStoragePromise) {
    firebaseStoragePromise = import(
      /* webpackChunkName: "storage" */ "firebase/storage"
    );
  }
  if (firebaseStoragePromise !== true) {
    await firebaseStoragePromise;
    firebaseStoragePromise = true;
  }

  return firebase;
};


export const saveFilesToFirebase = async ({
  prefix,
  files,
}: {
  prefix: string;
  files: { id: FileId; buffer: Uint8Array }[];
}) => {

  console.log("saveFilesToFirebase START ", files)
  const firebase = await loadFirebaseStorage();
  const erroredFiles = new Map<FileId, true>();
  const savedFiles = new Map<FileId, true>();

  await Promise.all(
    files.map(async ({ id, buffer }) => {
      try {
        await firebase
          .storage()
          .ref(`${prefix}/${id}`)
          .put(
            new Blob([buffer], {
              type: MIME_TYPES.binary,
            }),
            {
              cacheControl: `public, max-age=${FILE_CACHE_MAX_AGE_SEC}`,
            },
          );
        savedFiles.set(id, true);
      } catch (error: any) {
        erroredFiles.set(id, true);
      }
    }),
  );

  console.log("saveFilesToFirebase  END", savedFiles)
  return { savedFiles, erroredFiles };
};

export const loadFilesFromFirebase = async (
  prefix: string,
  decryptionKey: string,
  filesIds: readonly FileId[],
) => {
  console.log("loadFilesFromFirebase START", filesIds)
  const loadedFiles: BinaryFileData[] = [];
  const erroredFiles = new Map<FileId, true>();

  await Promise.all(
    [...new Set(filesIds)].map(async (id) => {
      try {
        const url = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_CONFIG.storageBucket
          }/o/${encodeURIComponent(prefix.replace(/^\//, ""))}%2F${id}`;
        const response = await fetch(`${url}?alt=media`);
        if (response.status < 400) {
          const arrayBuffer = await response.arrayBuffer();

          const { data, metadata } = await decompressData<BinaryFileMetadata>(
            new Uint8Array(arrayBuffer),
            {
              decryptionKey,
            },
          );

          const dataURL = new TextDecoder().decode(data) as DataURL;

          loadedFiles.push({
            mimeType: metadata.mimeType || MIME_TYPES.binary,
            id,
            dataURL,
            created: metadata?.created || Date.now(),
            lastRetrieved: metadata?.created || Date.now(),
          });
        } else {
          erroredFiles.set(id, true);
        }
      } catch (error: any) {
        erroredFiles.set(id, true);
        console.error(error);
      }
    }),
  );

  console.log("loadFilesFromFirebase END", loadedFiles)
  return { loadedFiles, erroredFiles };
};
