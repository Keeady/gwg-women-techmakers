import React, { Component } from 'react';

export class Wiki extends Component {
  constructor(props){
    super(props);
    this.state = {
        requestFailed: false,
      }
    }

  componentWillMount() {
    this.getData();
  }

  // the callback for fetching the information

  getData(){
    const link = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
    const url = link + this.props.currentCity;
    fetch(url)
    .then(response => {
      if(response.ok) return response;

      else if (!response.ok) {
        let location = this.props.currentCity;
        location = location.split(',').map(string => string.trim());
        location = `${[location[location.length -2]]}, ${[location[location.length -1]]}`;
        return fetch(link + location)
      }

    })
    .then(response => {
      if (response.ok) return response;
      else if (!response.ok) {
        let location = this.props.currentCity;
        location = location.split(',');
        location = location[location.length -1];
        return fetch(link + location)
      }
    })
    .then(data => data.json())
    .then(data => {
      this.setState({
        currentCity: this.props.currentCity,
        description: data.extract_html,
      })
    })
    .catch(error => {
    console.log(error)
    })
  }

  render(){

    const {description} = this.state;

    return (
      <div className="wikiDescription" dangerouslySetInnerHTML={{ __html: description}} />
    )
  }
}

export default Wiki;
