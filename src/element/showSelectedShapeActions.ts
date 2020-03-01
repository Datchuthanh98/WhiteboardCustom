import { AppState } from "../types";
import { ExcalidrawElement } from "./types";
import { getSelectedElements } from "../scene";

export const showSelectedShapeActions = (
  appState: AppState,
  elements: readonly ExcalidrawElement[],
) =>
  Boolean(
    appState.editingElement ||
      getSelectedElements(elements).length ||
      appState.elementType !== "selection",
  );
