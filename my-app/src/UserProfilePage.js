import { Form, Grid, Button, Header, Segment, Message, Image } from 'semantic-ui-react'
import { Component } from 'react'
import axios from 'axios'

class UserProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedInEmail: "",
      fetched_pokemon_name: "",
      pokemon_name: "",
      pokemon_height: "",
      pokemon_weight: "",
      error: false
    }
  }

  componentDidMount = () => {
    let loggedInEmail = localStorage.getItem('email')
    this.setState({
      ...this.state,
      loggedInEmail
    }, () => {
      this.retrieveFavouritePokemon();
    })
  }

  retrieveFavouritePokemon = () => {
    axios.post('/get_pokemon', {
      email: this.state.loggedInEmail
    })
    .then(response => {
      console.log('response from retrieve DB call', response)
      if(response.status === 200 && response.data.message) {
        this.setState({
          ...this.state,
          fetched_pokemon_name: response.data.message.pokemon_name,
          pokemon_weight: response.data.message.pokemon_weight,
          pokemon_height: response.data.message.pokemon_height,
        })
      }
    })
  }

  handleChange = (e) => {
    this.setState({
      ...this.state,
      [e.target.name]: e.target.value,
      message: "",
      error: false
    })
  }

  handlePokemonSave = () => {
    if(this.state.pokemon_name) {
      axios.post('/save_pokemon', {
        email: this.state.loggedInEmail,
        pokemon_name: this.state.pokemon_name
      })
      .then(response => {
        console.log('response', response)
        if(response.status === 200 && response.data.message) {
          this.setState({
            ...this.state,
            message: "Favourite pokemon updated",
            pokemon_weight: response.data.message.weight/10,
            pokemon_height: response.data.message.height/10
          }, () => {
            this.retrieveFavouritePokemon();
          })
        }        
      })
      .catch(function(error){
        console.log(error,'error');
      })
    } else {
      this.setState({
        ...this.state,
        message: "Pokemon name cannot be left empty",
        error: true
      })
    }
  }

  handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    document.location.href = "/"
  }

  render() {
    return (
      <>
        <div style={{ position: "absolute", top: 50, right: 30}}>
          {this.state.loggedInEmail} &nbsp;
          <Button onClick={this.handleSignOut}>Sign Out</Button>
        </div>
        <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as='h2' textAlign='center'>
              User Profile
            </Header>
            {this.state.fetched_pokemon_name && 
              (<p style={{ textAlign: 'left', marginTop: '5%', marginLeft: '2%'}}>
                Your favourite pokemon is <b> {this.state.fetched_pokemon_name}</b>,<br/>
                weight of <b> {this.state.pokemon_weight} kg</b>, <br/>
                height of <b> {this.state.pokemon_height} m</b>
              </p>)}
            
            <Form size='large'>
              <Segment stacked>
                <p style={{ textAlign: 'left'}}>
                  Enter to update the name of your favourite pokemon
                </p>
                <Form.Input
                  error={this.state.error}
                  name="pokemon_name"
                  fluid 
                  placeholder='Pokemon name'
                  onChange={this.handleChange}
                />
                <Button primary fluid size='large' onClick={this.handlePokemonSave}>
                  Save
                </Button>
              </Segment>
            </Form>
            {this.state.message && (<Message floating>{this.state.message}</Message>)}
          </Grid.Column>
        </Grid>
      </>
    );
  }
}

export default UserProfilePage;
