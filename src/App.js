import React, { Component } from 'react';
import './App.css';

const imgurUrl = '//api.imgur.com/3/album/';
const clientID = '42706ac58d35f3a';
const groupPackageIDs = [];
const discountPackageIDs = ['8iMka'];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      validAlbum: false,
      name: '',
      albumID: props.match.params.id,
      errorMsg: '',
      title: '',
      images: [],
      imagesSelected: new Set(),
      showOverlay: false,
      package: [
        {
          type: 'Basic',
          basePrice: 70.00,
          sessionLength: 90,
          incImages: 4,
          addImagePrice: 10.00
        },
        {
          type: 'Group',
          basePrice: 150.00,
          sessionLength: 120,
          incImages: 12,
          addImagePrice: 10.00
        }
      ],
      selectedPackage: 0,
      pricing: {
        addImageCost: 0,
        subtotal: 0,
        discountRate: 0,
      }
    };

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleAlbumChange = this.handleAlbumChange.bind(this);
    this.handleEntrySubmit = this.handleEntrySubmit.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.toggleImgSelection = this.toggleImgSelection.bind(this);
    this.toggleOverlay = this.toggleOverlay.bind(this);
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
        let images = res.data.images;

        let groupPackageSet = new Set(groupPackageIDs);

        self.setState({
          validAlbum: true,
          title: res.data.title,
          images: images,
          selectedPackage: groupPackageSet.has(self.state.albumID) ? 1 : 0
        });
      });
    }
    ).catch(function(err) {
      // Error
    });
  }

  handleConfirm(e) {
    e.preventDefault();

    let selectedPackage = this.state.package[this.state.selectedPackage];

    if(this.state.imagesSelected.size >= selectedPackage.incImages) {
      // Calculate pricing
      let imagesCost = this.state.imagesSelected.size * selectedPackage.addImagePrice - selectedPackage.incImages * selectedPackage.addImagePrice;
      let subtotal = selectedPackage.basePrice + imagesCost;

      let discountPackageSet = new Set(discountPackageIDs);

      this.setState({
        pricing: {
          addImageCost: imagesCost,
          subtotal: subtotal,
          discountRate: discountPackageSet.has(this.state.albumID) ? 0.5 : 0
        }
      }, this.toggleOverlay);
    }
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

  toggleOverlay(e) {
    this.setState({
      showOverlay: !this.state.showOverlay
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
        <input type='submit' value='Select images' />
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
              <button type='button' className='resetSelections' onClick={this.resetSelections}>Reset</button>
            </ul>
            <div className='photoCounter'>Package type: {this.state.package[this.state.selectedPackage].type}</div>
            <div className='photoCounter'>{this.state.imagesSelected.size}/{this.state.package[this.state.selectedPackage].incImages} images selected</div>
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

  renderOverlay() {
    let selectedPackage = this.state.package[this.state.selectedPackage];

    return(
      <div className='overlay'>
        <button className='close' onClick={this.toggleOverlay}>Back to images</button>
        <div className='cart'>
          <h1>My images</h1>
          <p>Package: {selectedPackage.type}</p>
          {this.state.pricing.discountRate > 0 ? <p>Discount: Friends and family (50% off)</p> : null}
          <p>{this.state.imagesSelected.size} images selected</p>

          {/* TODO: Table with base package, additional photos, and Friends and Family discount reflected (50% off), total */}
          <table className='invoice'>
            <tbody>
              <tr>
                <th>Item</th>
                <th className='totalCol'>Cost</th>
                <th className='totalCol'>Quantity</th>
                <th className='totalCol'>Total</th>
              </tr>
              <tr>
                <td>{selectedPackage.type} {selectedPackage.sessionLength} minute photoshoot, incl. {selectedPackage.incImages} edited images</td>
                <td className='totalCol'>${selectedPackage.basePrice}</td>
                <td className='totalCol'>1</td>
                <td className='totalCol'>${selectedPackage.basePrice}</td>
              </tr>
              <tr>
                <td>Additional edited images</td>
                <td className='totalCol'>${selectedPackage.addImagePrice}</td>
                <td className='totalCol'>{this.state.imagesSelected.size - selectedPackage.incImages}</td>
                <td className='totalCol'>${this.state.pricing.addImageCost}</td>
              </tr>
              <tr className='divider'></tr>
              <tr>
                <td></td>
                <td></td>
                <td className='totalCol'>Subtotal</td>
                <td className='totalCol'>${this.state.pricing.subtotal}</td>
              </tr>
              {this.state.pricing.discountRate > 0 ?
                <tr>
                  <td></td>
                  <td></td>
                  <td className='totalCol'>{this.state.pricing.discountRate * 100}% discount</td>
                  <td className='totalCol'>${this.state.pricing.subtotal * this.state.pricing.discountRate}</td>
                </tr>
                : null}
              <tr>
                <td></td>
                <td></td>
                <td className='totalCol total'>Total</td>
                <td className='totalCol total'>${this.state.pricing.subtotal - this.state.pricing.subtotal * this.state.pricing.discountRate}</td>
              </tr>
            </tbody>
          </table>

          {/* <p>Some summary about payment options</p> */}
          <p>Send this unique link with your photographer to share your selections:</p>

          {/* <input type='text' value='someurl' /> */}
          <button>Copy link</button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='root'>
        <div className={'container' + (!this.state.validAlbum ? ' backgroundFull' : '')}>
          {this.state.showOverlay ? this.renderOverlay() : null}
          {!this.state.validAlbum ? this.renderForm() : this.renderLayout()}
          <div className='copy'>&copy; {new Date().getFullYear()} Stephen Chen Photography</div>
        </div>
      </div>
    );
  }
}

export default App;
