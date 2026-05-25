const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // Dont't forget to call requesHandler
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      console.log(error);
      next(error);
    });
  };
};

export { asyncHandler };

// eg. of higher order fn

// const higherOrderFn = (fn) => {
//   () => {};
// };
