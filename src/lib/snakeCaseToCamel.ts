const snakeToCamel = (str: string) => {
  let splitStringArr = str.split("_");
  let builtStr = splitStringArr.reduce((acc, curr, i) => {
    curr = i !== 0 ? curr[0].toUpperCase() + curr.slice(1) : curr;
    return acc + curr;
  }, "");
  return builtStr;
};

export const convertResponse = <T extends { [key: string]: any }>(
  response: T
) => {
  let parentKeys = Object.keys(response);
  parentKeys.forEach((key) => {
    if(!response[key]) return;
    
    let currentObj = response[key];
    delete response[key];

    let newKey = snakeToCamel(key);

    // @ts-ignore
    response[newKey] = currentObj;

    if (typeof response[newKey] === "object") {
      convertResponse(response[newKey]);
    }
  });
  return response;
};
