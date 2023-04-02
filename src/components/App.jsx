import { useState, useEffect } from 'react';
import { Searchbar } from './Searchbar/Searchbar';
import { fetchImages } from './api/fetchImages';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import './App.css';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';
import Notiflix from 'notiflix';
import React from 'react';

let pageNr = 1;

export const App = () => {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [inputData, setInputData] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState('');
  const [modalAlt, setModalAlt] = useState('');
  const [totalHits, setTotalHits] = useState(0);

  const handleSubmit = async inputData => {
    pageNr = 1;
    if (inputData.trim() === '') {
      Notiflix.Notify.info('You cannot search by empty field, try again.');
      return;
    } else {
      try {
        setStatus('pending');
        const { totalHits, hits } = await fetchImages(inputData, pageNr);
        if (hits.length < 1) {
          setStatus('idle');
          Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        } else {
          setImages(hits);
          setInputData(inputData);
          setTotalHits(totalHits);
          setStatus('resolved');
        }
      } catch (error) {
        setStatus('rejected');
      }
    }
  };

  const handleClickMore = async () => {
    setStatus('pending');

    try {
      const { hits } = await fetchImages(inputData, (pageNr += 1));
      setImages(prevState => [...prevState, ...hits]);
      setStatus('resolved');
    } catch (error) {
      setStatus('rejected');
    }
  };

  const handleImageClick = e => {
    setModalOpen(true);
    setModalAlt(e.target.alt);
    setModalImg(e.target.name);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalImg('');
    setModalAlt('');
  };

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.code === 'Escape') {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
  }, []);

  if (status === 'idle') {
    return (
      <div className="App">
        <Searchbar onSubmit={handleSubmit} />
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="App">
        <Searchbar onSubmit={handleSubmit} />
        <ImageGallery onImageClick={handleImageClick} images={images} />
        <Loader />
        {totalHits > 12 && <Button onClick={handleClickMore} />}
        {modalOpen ? (
          <Modal src={modalImg} alt={modalAlt} handleClose={handleModalClose} />
        ) : null}
      </div>
    );
  }
  if (status === 'rejected') {
    return (
      <div className="App">
        <Searchbar onSubmit={handleSubmit} />
        <p>Something wrong, try later</p>
      </div>
    );
  }
  if (status === 'resolved') {
    return (
      <div className="App">
        <Searchbar onSubmit={handleSubmit} />
        <ImageGallery onImageClick={handleImageClick} images={images} />
        {totalHits > 12 && totalHits > images.length && (
          <Button onClick={handleClickMore} />
        )}
        {modalOpen ? (
          <Modal src={modalImg} alt={modalAlt} handleClose={handleModalClose} />
        ) : null}
      </div>
    );
  }
};
