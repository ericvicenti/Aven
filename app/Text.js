({ React, Platform, _npm_react_native, _npm_react_native_web }) => {
  if (_npm_react_native) {
    return _npm_react_native.Text;
  }
  if (_npm_react_native_web) {
    return _npm_react_native_web.Text;
  }
  return null;
};
