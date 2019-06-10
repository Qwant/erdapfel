const ControlHelper = {
  tag: (tag, content, onclick) => {
    const tagBuilt = document.createElement(tag);
    tagBuilt.onclick = onclick;
  },
};

export default ControlHelper;
