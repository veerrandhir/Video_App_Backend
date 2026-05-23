const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export { asyncHandler };

// eg. of higher order fn

// const higherOrderFn = (fn) => {
//   () => {};
// };
