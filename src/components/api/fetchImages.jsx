import axios from 'axios';

axios.defaults.baseURL = `https://pixabay.com/api`;

export const fetchImages = async (inputData, pageNr) => {
  const response = await axios.get(
    `/?q=${inputData}&page=${pageNr}&key=33424543-ad7f1dfa8b6f1d99895f0282d&image_type=photo&orientation=horizontal&per_page=12`
  );
  return response.data;
};
