import { Component } from 'react';
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

export class App extends Component {
  state = {
    images: [],
    status: 'idle',
    inputData: '',
    modalOpen: false,
    modalImg: '',
    modalAlt: '',
    totalHits: 0,
  };

  handleSubmit = async inputData => {
    pageNr = 1;
    if (inputData.trim() === '') {
      Notiflix.Notify.info('You cannot search by empty field, try again.');
      return;
    } else {
      try {
        this.setState({ status: 'pending' });
        const { totalHits, hits } = await fetchImages(inputData, pageNr);
        if (hits.length < 1) {
          this.setState({ status: 'idle' });
          Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        } else {
          this.setState({
            images: hits,
            inputData,
            totalHits: totalHits,
            status: 'resolved',
          });
        }
      } catch (error) {
        this.setState({ status: 'rejected' });
      }
    }
  };

  handleClickMore = async () => {
    this.setState({ status: 'pending' });

    try {
      const { hits } = await fetchImages(this.state.inputData, (pageNr += 1));
      this.setState(prevState => ({
        images: [...prevState.images, ...hits],
        status: 'resolved',
      }));
    } catch (error) {
      this.setState({ status: 'rejected' });
    }
  };

  handleImageClick = e => {
    this.setState({
      modalOpen: true,
      modalAlt: e.target.alt,
      modalImg: e.target.name,
    });
  };

  handleModalClose = () => {
    this.setState({
      modalOpen: false,
      modalImg: '',
      modalAlt: '',
    });
  };

  handleKeyDown = event => {
    if (event.code === 'Escape') {
      this.handleModalClose();
    }
  };

  async componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  render() {
    const { totalHits, status, images, modalOpen, modalImg, modalAlt } =
      this.state;
    if (status === 'idle') {
      return (
        <div className="App">
          <Searchbar onSubmit={this.handleSubmit} />
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <div className="App">
          <Searchbar onSubmit={this.handleSubmit} />
          <ImageGallery onImageClick={this.handleImageClick} images={images} />
          <Loader />
          {totalHits > 12 && <Button onClick={this.handleClickMore} />}
          {modalOpen ? (
            <Modal
              src={modalImg}
              alt={modalAlt}
              handleClose={this.handleModalClose}
            />
          ) : null}
        </div>
      );
    }
    if (status === 'rejected') {
      return (
        <div className="App">
          <Searchbar onSubmit={this.handleSubmit} />
          <p>Something wrong, try later</p>
        </div>
      );
    }
    if (status === 'resolved') {
      return (
        <div className="App">
          <Searchbar onSubmit={this.handleSubmit} />
          <ImageGallery onImageClick={this.handleImageClick} images={images} />
          {totalHits > 12 && totalHits > images.length && (
            <Button onClick={this.handleClickMore} />
          )}
          {modalOpen ? (
            <Modal
              src={modalImg}
              alt={modalAlt}
              handleClose={this.handleModalClose}
            />
          ) : null}
        </div>
      );
    }
  }
}
