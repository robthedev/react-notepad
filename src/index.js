import React, { Component, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  convertFromRaw,
  convertToRaw,
  Editor,
  EditorState,
  getDefaultKeyBinding,
  RichUtils
} from "draft-js";

const ReactNotepad = props => {
  const {
    rootWidth,
    rootBgColor,
    rootColor,
    rootBorder,
    rootBorderRadius,
    rootOverflow,
    showBorder,
    editorHeight,
    editorMinHeight,
    editorMaxHeight,
    editorPadding,
    editorAlignText,
    controlsColor,
    controlsBorder,
    controlsMargin,
    controlsPadding,
    useLocalStorage
  } = props;
  const initialContent = () => {
    if (useLocalStorage) {
      const content = window.localStorage.getItem("reactnotepad_content");
      if (content) {
        return EditorState.createWithContent(
          convertFromRaw(JSON.parse(content))
        );
      } else {
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  };

  const [editorState, setEditorState] = useState(initialContent());
  const editor = useRef(null);

  const BLOCK_TYPES = [
    { label: "P", style: "paragraph" },
    { label: "H1", style: "header-one" },
    { label: "H2", style: "header-two" },
    { label: "H3", style: "header-three" },
    { label: "H4", style: "header-four" },
    { label: "H5", style: "header-five" },
    { label: "H6", style: "header-six" },
    { label: "Blockquote", style: "blockquote" },
    { label: "UL", style: "unordered-list-item" },
    { label: "OL", style: "ordered-list-item" },
    { label: "Code Block", style: "code-block" }
  ];

  const INLINE_STYLES = [
    { label: "Bold", style: "BOLD" },
    { label: "Italic", style: "ITALIC" },
    { label: "Underline", style: "UNDERLINE" },
    { label: "Monospace", style: "CODE" }
  ];

  const ReactNotepadRoot = {
    width: rootWidth ? rootWidth : "550px",
    backgroundColor: rootBgColor ? rootBgColor : "#fff",
    color: rootColor ? rootColor : "#000",
    border:
      showBorder || showBorder !== false
        ? rootBorder
          ? `${rootBorder.size} ${rootBorder.style} ${rootBorder.color}`
          : "1px solid #000"
        : "none",
    borderRadius: rootBorderRadius ? rootBorderRadius : "5px",
    overflow: rootOverflow ? rootOverflow : "auto"
  };

  const ReactNotepadEditorStyle = {
    height: editorHeight ? editorHeight : "auto",
    minHeight: editorMinHeight ? editorMinHeight : "200px",
    maxHeight: editorMaxHeight ? editorMinHeight : "575px",
    padding: editorPadding ? editorPadding : "1rem",
    textAlign: editorAlignText ? editorAlignText : "left"
  };

  const ReactNotepadControls = {
    display: "flex",
    justifyContent: "space-evenly",
    margin: controlsMargin ? controlsMargin : "1rem 1rem 0 1rem",
    paddingBottom: controlsPadding ? controlsPadding : "0.5rem",
    borderBottom: controlsBorder
      ? `${controlsBorder.size} ${controlsBorder.style} ${controlsBorder.color}`
      : "1px solid #6c757c",
    color: controlsColor ? controlsColor : "#000"
  };

  const styleMap = {
    CODE: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2
    }
  };
  const focusEditor = () => {
    editor.current.focus();
  };

  const saveContent = content => {
    localStorage.setItem("content", JSON.stringify(convertToRaw(content)));
  };

  const onChange = editorState => {
    const contentState = editorState.getCurrentContent();
    saveContent(contentState);
    setEditorState(editorState);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  };

  const mapKeyToEditorCommand = e => {
    if (e.keyCode === 9) {
      const newEditorState = RichUtils.onTab(e, editorState, 4);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  const toggleBlockType = blockType => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = inlineStyle => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const getBlockStyle = block => {
    if (block.getType() === "blockquote") {
      return "Reactnotepad-blockquote";
    } else {
      return null;
    }
  };

  const BlockStyleControls = () => {
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    return (
      <div style={ReactNotepadControls}>
        {BLOCK_TYPES.map(type => (
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={toggleBlockType}
            style={type.style}
          />
        ))}
      </div>
    );
  };

  const InlineStyleControls = props => {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return (
      <div style={ReactNotepadControls}>
        {INLINE_STYLES.map(type => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    focusEditor();
  }, []);

  return (
    <div className="react-notepad-container">
      <div style={ReactNotepadRoot}>
        <BlockStyleControls
          editorState={editorState}
          onToggle={toggleBlockType}
        />
        <InlineStyleControls
          editorState={editorState}
          onToggle={toggleInlineStyle}
        />
        <div onClick={focusEditor} style={ReactNotepadEditorStyle}>
          <Editor
            ref={editor}
            editorState={editorState}
            onChange={onChange}
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            spellCheck={true}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={mapKeyToEditorCommand}
          />
        </div>
      </div>
    </div>
  );
};

class StyleButton extends Component {
  constructor(props) {
    super(props);
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }
  ReactNotepadStyleButton = {
    cursor: "pointer"
  };

  ReactNotepadStyleButtonActive = {
    cursor: "pointer",
    fontWeight: "bold",
    opacity: 0.6
  };

  render() {
    let style = this.ReactNotepadStyleButton;
    if (this.props.active) {
      style = this.ReactNotepadStyleButtonActive;
    }
    return (
      <span style={style} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

ReactNotepad.PropTypes = {
  rootWidth: PropTypes.string,
  rootBgColor: PropTypes.string,
  rootColor: PropTypes.string,
  rootBorder: PropTypes.object,
  rootBorderRadius: PropTypes.string,
  rootOverflow: PropTypes.string,
  showBorder: PropTypes.string,
  editorHeight: PropTypes.string,
  editorMinHeight: PropTypes.string,
  editorMaxHeight: PropTypes.string,
  editorPadding: PropTypes.string,
  editorAlignText: PropTypes.string,
  controlsColor: PropTypes.string,
  controlsBorder: PropTypes.object,
  controlsMargin: PropTypes.string,
  controlsPadding: PropTypes.string,
  useLocalStorage: PropTypes.bool
};

export default ReactNotepad;
