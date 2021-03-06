import { GetProjectsResult,Subscriber } from '../api';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Col,
  FormGroup,
  Form,
  FormFeedback,
  Input,
  Label
} from 'reactstrap';

import './List.css';
import io from 'socket.io-client';
const  socket = io.connect('http://localhost:3001');

//const socket =  io.connect("http://localhost:3001",{secure:true});

class List extends Component {  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: false,
      error: null,
    };
    
    
    Subscriber((data) => 
    {
      console.log('Projects -- Updated: '+JSON.stringify(data));
     
      this.setState(
        {
          projects:data.projects
        });
      
    });

    socket.on('ProjectsUpdated', (data) =>
    { 
        console.log("Listing from server");
        console.log('Projects -- Updated: '+JSON.stringify(data));
        
         this.setState(
           {
             projects:data.projects
           });
         
    });
    // socket.on('ProjectsUpdated', (data) => 
    // {
    //   console.log('Projects -- Updated: '+JSON.stringify(data));
     
    //   this.setState(
    //     {
    //       projects:data.projects
    //     });
      
    // });
   
  }
  
  

  async fetch() {
    try {
      await new Promise(res => this.setState({
        loading: true,
      }, res));
      let result = await fetch(`/api/projects/` , {
        headers : { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
         }
  
      }
);
      if(result.status !== 200) {
        this.setState({
          loading: false,
          error: await result.text(),
        });
        return;
      }
      let json = await result.json();
     
      this.setState({
        loading: false,
        error: null,
        data: json
      });
      
    } catch(e) {
      this.setState({
        loading: false,
        error: e,
      });
    }
  }
  componentWillMount() {
    this.fetch();
  }

  submit() 
  {
    this.setState({
      loading: true,
    }, async () => {
      var params={
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           language: this.state.searchQuery,
          
        }),
      };
      GetProjectsResult(params);
      let result = await fetch('/api/projects/',params);
      if(result.status !== 200) {
        this.setState({
          loading: false,
          error: await result.text(),
        });
        return;
      }
      let json = await result.json();
      if(json.success) {
      this.setState({ projects:  json.projects}); 
      } else {
        this.setState({
          loading: false,
          errors: json.errors,
        });
      }
    });
  }
  updateSearchQuery(ev) 
  {
    if(this.state.loading) return;
    this.setState({
      searchQuery: ev.target.value,
    });
  }
   
  render() {
    if(this.state.error) {
      return <div>{this.state.error.toString()}</div>;
    }
    if(this.state.loading) {
      return <div>Loading</div>;
    }
    return (
      <React.Fragment>
      <Form>
      <FormGroup row>
        <Label for="title" sm={2}>Title</Label>
        <Col sm={10}>
          <Input
            type="text"
            name="title"
            id="title"
            placeholder="Title"
            sm={10}
            onChange={e => this.updateSearchQuery(e)}
            value={this.state.searchQuery}
            disabled={this.state.loading}
             />
          
        </Col>
      </FormGroup>
       
      <FormGroup row>
      <Col sm={2}>  &nbsp; </Col>
        <Col sm={10}>
          <Button className="button" onClick={() => this.submit()}  disabled={this.state.loading}>Save</Button> &nbsp;
          <Button className="button" tag={Link} to='/' disabled={this.state.loading}>Cancel</Button>
        </Col>
      </FormGroup>
    </Form>

     
        
<ul className="list">
  {
            this.state.data.projects.items.map(project =>
             <li key={project.repository.id}>
                <h4>{project.repository.name}</h4>
                <h4>{project.repository.id}</h4>         
            </li>
          )}
        </ul>
      </React.Fragment>
    );
  }
}

export default List;
