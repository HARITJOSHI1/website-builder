import { Dispatch, createContext, useContext, useReducer } from "react";
import { EditorActions } from "./editor-actions";
import {
  MasterEditorState,
  HistoryState,
  EditorElement,
  DeviceTypes,
} from "./types";
import { FunnelPage } from "@prisma/client";

// init states for our website builder provider
const initialEditorState: MasterEditorState["editor"] = {
  elements: [
    {
      content: [],
      id: "__body",
      name: "Body",
      styles: {},
      type: "__body",
    },
  ],

  selectedElement: {
    content: [],
    id: "",
    name: "",
    styles: {},
    type: null,
  },

  liveMode: false,
  device: "Desktop",
  previewMode: false,
  funnelPageId: "",
};

const initialHistoryState: HistoryState = {
  history: [initialEditorState],
  currentIndex: 0,
};

const initialMasterEditorState: MasterEditorState = {
  editor: initialEditorState,
  stack: initialHistoryState,
};

const addAnElement = (
  editorArray: EditorElement[],
  action: EditorActions
): EditorElement[] => {
  if (action.type !== "ADD_ELEMENT")
    throw Error(
      "You sent the wrong action type to the Add Element editor State"
    );
  return editorArray.map((item) => {
    if (item.id === action.payload.containerId && Array.isArray(item.content)) {
      return {
        ...item,
        content: [...item.content, action.payload.elementDetails],
      };
    } else if (item.content && Array.isArray(item.content)) {
      return {
        ...item,
        content: addAnElement(item.content, action),
      };
    }
    return item;
  });
};

const updateAnElement = (
  editorArray: EditorElement[],
  action: EditorActions
): EditorElement[] => {
  if (action.type !== "UPDATE_ELEMENT")
    throw Error("You sent the wrong action type to the update Element State");

  return editorArray.map((item) => {
    if (item.id === action.payload.elementDetails.id) {
      return { ...item, ...action.payload.elementDetails };
    } else if (item.content && Array.isArray(item.content)) {
      return {
        ...item,
        content: updateAnElement(item.content, action),
      };
    }
    return item;
  });
};

const deleteAnElement = (
  editorArray: EditorElement[],
  action: EditorActions
): EditorElement[] => {
  if (action.type !== "DELETE_ELEMENT")
    throw Error("You sent the wrong action type to the update Element State");

  return editorArray.filter((item) => {
    if (item.id === action.payload.elementDetails.id) {
      return false;
    } else if (item.content && Array.isArray(item.content)) {
      item.content = deleteAnElement(item.content, action);
    }
    return true;
  });
};

// reducer.........
const editorReducer = (
  state = initialMasterEditorState,
  actions: EditorActions
): MasterEditorState => {
  switch (actions.type) {
    case "ADD_ELEMENT":
      const updatedEditorState = {
        ...state.editor,
        elements: addAnElement(state.editor.elements, actions),
      };

      const updatedHistory = [
        ...state.stack.history.slice(0, state.stack.currentIndex + 1),
        { ...updatedEditorState },
      ];

      const newEditorState = {
        ...state,
        editor: updatedEditorState,
        history: {
          ...state.stack.history,
          history: updatedHistory,
          currentIndex: updatedHistory.length - 1,
        },
      };

      return newEditorState;

    case "CHANGE_CLICKED_ELEMENT":
      const clickedState = {
        ...state,
        editor: {
          ...state.editor,
          selectedElement: actions.payload.elementDetails || {
            id: "",
            content: [],
            name: "",
            styles: {},
            type: null,
          },
        },
        history: {
          ...state.stack.history,
          history: [
            ...state.stack.history.slice(0, state.stack.currentIndex + 1),
            { ...state.editor }, // Save a copy of the current editor state
          ],
          currentIndex: state.stack.currentIndex + 1,
        },
      };
      return clickedState;

    case "CHANGE_DEVICE":
      const changedDeviceState = {
        ...state,
        editor: {
          ...state.editor,
          device: actions.payload.device,
        },
      };
      return changedDeviceState;

    case "LOAD_DATA":
      return {
        ...state,
        editor: {
          ...state.editor,
          elements: actions.payload.elements || initialEditorState.elements,
          liveMode: !!actions.payload.withLive,
        },
      };

    case "REDO":
      if (state.stack.currentIndex <= state.stack.history.length - 1) {
        const nextIndex = state.stack.currentIndex + 1;
        const nextEditorState = { ...state.stack.history[nextIndex] };

        const redoState = {
          ...state,
          editor: nextEditorState,
          history: {
            ...state.stack.history,
            currentIndex: nextIndex,
          },
        };
        return redoState;
      }

      return state;

    case "SET_FUNNELPAGE_ID":
      const { funnelPageId } = actions.payload;
      const updatedEditorStateWithFunnelPageId = {
        ...state.editor,
        funnelPageId,
      };

      const updatedHistoryWithFunnelPageId = [
        ...state.stack.history.slice(0, state.stack.currentIndex + 1),
        { ...updatedEditorStateWithFunnelPageId }, // Save a copy of the updated state
      ];

      const funnelPageIdState = {
        ...state,
        editor: updatedEditorStateWithFunnelPageId,
        history: {
          ...state.stack.history,
          history: updatedHistoryWithFunnelPageId,
          currentIndex: updatedHistoryWithFunnelPageId.length - 1,
        },
      };
      return funnelPageIdState;

    case "TOGGLE_PREVIEW_MODE":
      const toggleState = {
        ...state,
        editor: {
          ...state.editor,
          previewMode: !state.editor.previewMode,
        },
      };
      return toggleState;

    case "TOGGLE_LIVE_MODE":
      const toggleLiveMode: MasterEditorState = {
        ...state,
        editor: {
          ...state.editor,
          liveMode: actions.payload
            ? actions.payload.value
            : !state.editor.liveMode,
        },
      };
      return toggleLiveMode;

    case "UNDO":
      if (state.stack.currentIndex > 0) {
        const prevIndex = state.stack.currentIndex - 1;
        const prevEditorState = { ...state.stack.history[prevIndex] };
        const undoState = {
          ...state,
          editor: prevEditorState,
          history: {
            ...state.stack,
            currentIndex: prevIndex,
          },
        };
        return undoState;
      }
      return state;

    case "DELETE_ELEMENT":
      const deletedElements = deleteAnElement(state.editor.elements, actions);

      const deletedEditorStateWithUpdate = {
        ...state.editor,
        elements: deletedElements,
      };

      const deletedHistoryWithUpdate = [
        ...state.stack.history.slice(0, state.stack.currentIndex + 1),
        { ...deletedEditorStateWithUpdate }, // Save a copy of the updated state
      ];

      const deletedEditor = {
        ...state,
        editor: deletedEditorStateWithUpdate,
        history: {
          ...state.stack.history,
          history: deletedHistoryWithUpdate,
          currentIndex: deletedHistoryWithUpdate.length - 1,
        },
      };

      return deletedEditor;

    case "UPDATE_ELEMENT":
      // Perform your logic to update the element in the state
      const updatedElements = updateAnElement(state.editor.elements, actions);
      const UpdatedElementIsSelected =
        state.editor.selectedElement.id === actions.payload.elementDetails.id;

      const updatedEditorStateWithUpdate = {
        ...state.editor,
        elements: updatedElements,
        selectedElement: UpdatedElementIsSelected
          ? actions.payload.elementDetails
          : {
              id: "",
              content: [],
              name: "",
              styles: {},
              type: null,
            },
      };

      const updatedHistoryWithUpdate = [
        ...state.stack.history.slice(0, state.stack.currentIndex + 1),
        { ...updatedEditorStateWithUpdate }, // Save a copy of the updated state
      ];
      const updatedEditor = {
        ...state,
        editor: updatedEditorStateWithUpdate,
        history: {
          ...state.stack.history,
          history: updatedHistoryWithUpdate,
          currentIndex: updatedHistoryWithUpdate.length - 1,
        },
      };
      return updatedEditor;

    default:
      return state;
  }
};

export type EditorContextData = {
  device: DeviceTypes;
  previewMode: boolean;
  setPreviewMode: (previewMode: boolean) => void;
  setDevice: (device: DeviceTypes) => void;
};

export const EditorContext = createContext<{
  state: MasterEditorState;
  dispatch: Dispatch<EditorActions>;
  subaccountId: string;
  funnelId: string;
  pageDetails: FunnelPage | null;
}>({
  state: initialMasterEditorState,
  dispatch: () => undefined,
  subaccountId: "",
  funnelId: "",
  pageDetails: null,
});

type EditorProps = {
  children: React.ReactNode;
  subaccountId: string;
  funnelId: string;
  pageDetails: FunnelPage;
};

const EditorProvider = (props: EditorProps) => {
  const [state, dispatch] = useReducer(editorReducer, initialMasterEditorState);

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        subaccountId: props.subaccountId,
        funnelId: props.funnelId,
        pageDetails: props.pageDetails,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor() hook must be used within the editor Provider");
  }
  return context;
};

export default EditorProvider;
