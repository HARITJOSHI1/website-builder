import { EditorBtns } from "@/lib/constants";
import { EditorActions } from "./editor-actions";

export type DeviceTypes = "Desktop" | "Mobile" | "Tablet";

export type EditorElement = {
  id: string;
  styles: React.CSSProperties;
  name: string;
  type: EditorBtns;
  content: EditorElement | [];
};

export type Editor = {
  liveMode: boolean;
  elements: EditorElement[];
  selectedElement: EditorElement;
  device: DeviceTypes;
  previewMode: boolean;
  funnelPageId: string;
};

export type HistoryState = {
  history: Editor[];
  currentIndex: number;
};

export type MasterEditorState = {
  stack: HistoryState;
  editor: Editor;
};

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

// reducer.........
const editorReducer = (
  state = initialMasterEditorState,
  actions: EditorActions
): MasterEditorState | null => {
  switch (actions.type) {
    case "ADD_ELEMENT":
    case "CHANGE_CLICKED_ELEMENT":
    case "CHANGE_DEVICE":
    case "DELETE_ELEMENT":
    case "LOAD_DATA":
    case "REDO":
    case "SET_FUNNELPAGE_ID":
    case "TOGGLE_LIVE_MODE":
    case "TOGGLE_PREVIEW_MODE":
    case "UNDO":
    case "UPDATE_ELEMENT":
    default:
      return state;
  }
};
