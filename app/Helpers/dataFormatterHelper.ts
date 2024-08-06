const formatData = (data: any[], fieldsToExclude: string[]): any[] => {
  return data.map(item => {
    const formattedItem = { ...item };
    fieldsToExclude.forEach(field => {
      delete formattedItem[field];
    });
    return formattedItem;
  });
};

const renameKeys = (data: any[], keyMap: { [key: string]: string }): any[] => {
  return data.map(item => {
    const newItem = { ...item };
    Object.keys(keyMap).forEach(key => {
      if (newItem.hasOwnProperty(key)) {
        newItem[keyMap[key]] = newItem[key];
        delete newItem[key];
      }
    });
    return newItem;
  });
};

export { formatData, renameKeys };
