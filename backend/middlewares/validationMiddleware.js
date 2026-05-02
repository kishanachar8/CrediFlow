module.exports = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

  if (error) {
    error.status = 400;
    return next(error);
  }

  req[property] = value;
  return next();
};
