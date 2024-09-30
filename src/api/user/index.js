export const userApi = {
  async call(url, requestOptions) {
    return await fetch(url, requestOptions).then((response) => response.json());
  },
};
