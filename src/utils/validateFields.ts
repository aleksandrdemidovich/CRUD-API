export const validateRequiredFields = (
  username: string,
  age: number,
  hobbies: string[] | [],
) => {
  if (!username || !age || !hobbies) {
    return true;
  }
};

export const validateFieldsType = (
  username: string,
  age: number,
  hobbies: string[] | [],
) => {
  const errors = {
    username: typeof username !== 'string' ? 'Username must be a string' : '',
    age: typeof age !== 'number' ? 'Age must be a number' : '',
    hobbies:
      !Array.isArray(hobbies) || !hobbies.every((el) => typeof el === 'string')
        ? 'Hobbies must be an array of strings or empty'
        : '',
  };

  const errorFields = Object.entries(errors)
    .filter(([, error]) => error !== '')
    .reduce((obj, [key, error]) => ({ ...obj, [key]: error }), {});

  return Object.keys(errorFields).length ? errorFields : null;
};
