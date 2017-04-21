import React, { Component } from 'react';
import './App.css';

const imgurUrl = '//api.imgur.com/3/album/';
const clientID = '42706ac58d35f3a';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      validAlbum: false,
      // name: '',
      name: 'Stephen',
      // albumID: '',
      albumID: '8iMka',
      errorMsg: '',
      title: '',
      images: [],
      imagesSelected: new Set()
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleAlbumChange = this.handleAlbumChange.bind(this);
    this.handleEntrySubmit = this.handleEntrySubmit.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.toggleImgSelection = this.toggleImgSelection.bind(this);
    this.resetSelections = this.resetSelections.bind(this);
  }

  handleNameChange(e) {
    this.setState({
      name: e.target.value
    });
  }

  handleAlbumChange(e) {
    this.setState({
      albumID: e.target.value
    });
  }

  handleEntrySubmit(e) {
    e.preventDefault();

    let self = this;
    let url = imgurUrl + this.state.albumID;

    if(self.state.name.length <= 0) {
      self.setState({
        errorMsg: 'Please enter your name'
      });

      return;
    }

    window.fetch(url, {
      method: 'get',
      headers: {
        'Authorization': 'Client-ID ' + clientID
      }
    }).then(function(res) {
      if(res.status !== 200) {
        self.setState({
          errorMsg: 'Could not find session. Status code: ' + res.status
        });

        return;
      }

      res.json().then(function(res) {
        let images = res.data.images

        self.setState({
          validAlbum: true,
          title: res.data.title,
          images: images
        });
      });
    }
    ).catch(function(err) {
      // Error
    });
  }

  handleConfirm(e) {
    e.preventDefault();
  }

  toggleImgSelection(index) {
    if(!this.state.imagesSelected.has(index)) {
      this.state.imagesSelected.add(index);
    }
    else {
      this.state.imagesSelected.delete(index);
    }

    this.setState({
      imagesSelected: this.state.imagesSelected
    });
  }

  resetSelections(e) {
    this.setState({
      imagesSelected: new Set()
    });
  }

  renderForm() {
    return (
      <form className='entry' onSubmit={this.handleEntrySubmit}>
        <h1>Hello.</h1>
        <p>Enter your name and session code to view and select images from your photoshoot.</p>
        <label htmlFor='name'>Your name *</label>
        <input type='text' name='name' value={this.state.name} onChange={this.handleNameChange} />
        {/* TODO: collaborative feature checkbox */}
        <label htmlFor='albumID'>Session code *</label>
        <input type='text' name='albumID' value={this.state.albumID} onChange={this.handleAlbumChange} />
        <div className='errorMsg'>{this.state.errorMsg}</div>
        <input type='submit' value='View images' />
      </form>
    );
  }

  renderLayout() {
    return (
      <div className='layout'>
        <div className='sidebar'>
          <form onSubmit={this.handleConfirm}>
            {/* <h1>{this.state.title}</h1> */}
            <ul className='curSelections'>
              {this.state.imagesSelected.size === 0 ? <li className='noImages'>Select an image</li> : null }
              {this.state.images.map((value, index) => {
                if(this.state.imagesSelected.has(index)) {
                  return (
                    // <li key={index}>{index + 1}. {value.id}</li>
                    <li key={index}>
                      <img src={value.link} alt='preview' />
                    </li>
                  );
                }

                return null;
              })}
              <button className='resetSelections' onClick={this.resetSelections}>Reset</button>
            </ul>
            <div className='photoCounter'>Images selected: {this.state.imagesSelected.size}</div>
            <input type='submit' value='Confirm' />
            {/* <div className='toggleDarkMode'>Toggle dark mode</div> */}
          </form>
        </div>
        <div className='content'>
          <ul className='imgList'>
            {this.state.images.map((value, index) => {

              return (
                <li key={index}>
                  <div className='shield' onClick={() => this.toggleImgSelection(index)}>
                    {this.state.imagesSelected.has(index) ? <div className='selectedFill'></div> : null}
                  </div>
                  <img src={value.link} alt='preview' />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='root'>
        <div className={'container' + (!this.state.validAlbum ? ' backgroundFull' : '')}>
          <div className='overlay'></div>
          {!this.state.validAlbum ? this.renderForm() : this.renderLayout()}
          <div className='copy'>&copy; {new Date().getFullYear()} Stephen Chen Photography</div>
        </div>
      </div>
    );
  }
}

export default App;
