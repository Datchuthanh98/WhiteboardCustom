import { create } from "zustand";

interface State {
  idRoom: string;
  idConnection: string;
  tokenConnection: string;
  idWhiteboard: string;
  isUseWhiteboardCommon: boolean;
  setData: (data: any) => void;
  setUsetWhiteboardCommon: (isCommon: boolean) => void;
}

export const useStore = create<State>((set) => ({
  idRoom: "",
  idConnection: "",
  tokenConnection: "",
  idWhiteboard: "",
  isUseWhiteboardCommon: false,
  setData(data) {
    set({
      idRoom: data.idRoom,
      idConnection: data.idConnection,
      tokenConnection: data.tokenConnection,
      idWhiteboard: data.idWhiteboard,
    });
  },
  setUsetWhiteboardCommon(isCommon) {
    set({ isUseWhiteboardCommon: isCommon });
  },
}));
