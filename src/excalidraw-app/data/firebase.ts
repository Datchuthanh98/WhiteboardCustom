import { ExcalidrawElement, FileId } from "../../element/types";
import {
  BinaryFileData,
  BinaryFileMetadata,
  DataURL,
} from "../../types";
import { FILE_CACHE_MAX_AGE_SEC } from "../app_constants";
import { decompressData } from "../../data/encode";
import { MIME_TYPES } from "../../constants";

export const saveFilesToFirebase = async ({
  prefix,
  files,
}: {
  prefix: string;
  files: { id: FileId; buffer: Uint8Array }[];
}) => {

  const erroredFiles = new Map<FileId, true>();
  const savedFiles = new Map<FileId, true>();
  await Promise.all(
    files.map(async ({ id, buffer }) => {
      try {
        const idRoom = window.location.href.split("room=")[1].split(",")[0]
        //Custome Load SV
        const formData = new FormData();
        const blobFile = new Blob([buffer], {
          type: MIME_TYPES.binary,
        });
        formData.append("image", blobFile, "test.jpg");
        await fetch(`http://localhost:3101/api/v1/images/upload?idField=${id}&idRoom=${idRoom}`, {
          method: "Post",
          body: formData,
        });

        savedFiles.set(id, true);
        //
      } catch (error: any) {
        erroredFiles.set(id, true);
      }
    }),
  );
  return { savedFiles, erroredFiles };
};

export const loadFilesFromFirebase = async (
  prefix: string,
  decryptionKey: string,
  filesIds: readonly FileId[],
) => {
  const loadedFiles: BinaryFileData[] = [];
  const erroredFiles = new Map<FileId, true>();

  await Promise.all(
    [...new Set(filesIds)].map(async (id) => {
      try {
        const idRoom = window.location.href.split("room=")[1].split(",")[0]
        const response2 = await fetch(`http://localhost:3101/api/v1/images/getfile?idField=${id}&idRoom=${idRoom}`, {
          method: "Get",
        });
        if (response2.status < 400) {
          const arrayBuffer = await response2.arrayBuffer();
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

  return { loadedFiles, erroredFiles };
};
