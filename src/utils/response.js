exports.successMessage = function successMessage(data, ...rest) {
  let dataToReturn = {
    success: true,
    data: data,
  };

  if (rest.length > 0) dataToReturn.meta = [...rest];

  return dataToReturn;
};
