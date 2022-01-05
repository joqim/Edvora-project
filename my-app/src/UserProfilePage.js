import { Form, Grid, Button, Header, Segment, Message, Image } from 'semantic-ui-react'
import { Component } from 'react'
import axios from 'axios'

class UserProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedInEmail: "",
      loggedInUsername: "",
      fetched_pokemon_name: "",
      pokemon_name: "",
      pokemon_height: "",
      pokemon_weight: "",
      error: false,
      message: "",
      pokemon_abilities: [],
      pokemon_moves: []
    }
  }

  componentDidMount = () => {
    let loggedInEmail = localStorage.getItem('email')
    let loggedInUsername = localStorage.getItem('username')
    this.setState({
      ...this.state,
      loggedInEmail,
      loggedInUsername
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
          pokemon_weight: response.data.message.pokemon_weight/10,
          pokemon_height: response.data.message.pokemon_height/10,
          pokemon_abilities: response.data.message.pokemon_abilities,
          pokemon_moves: response.data.message.pokemon_moves
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
        if(response.status === 200 && response.data.message.name) {
          this.setState({
            ...this.state,
            message: "Favourite pokemon updated",
            // pokemon_weight: response.data.message.weight/10,
            // pokemon_height: response.data.message.height/10
          }, () => {
            this.retrieveFavouritePokemon();
          })
        } else if(response.status === 200 && !response.data.message.name) {
          this.setState({
            ...this.state,
            message: response.data.message
          }, () => {
            document.location.href="/user_profile#message"
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
      }, () => {
        document.location.href="/user_profile#message"
      })
    }
  }

  handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('username')
    document.location.href = "/"
  }

  render() {
    console.log('state in user profile', this.state)
    return (
      <>
        <div style={{ position: "absolute", top: 50, right: 30}}>
          Welcome <b>{this.state.loggedInUsername}</b> &nbsp;&nbsp;&nbsp;
          <Button onClick={this.handleSignOut}>Sign Out</Button>
        </div>
        <Grid textAlign='center' style={{ height: '100vh', marginTop: '5%' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as='h2' textAlign='center'>
              User Profile
            </Header>
            {this.state.fetched_pokemon_name && 
              (<p style={{ textAlign: 'left', marginTop: '5%', marginLeft: '2%'}}>
                Your favourite pokemon is 
                <b> {this.state.fetched_pokemon_name.charAt(0).toUpperCase() + this.state.fetched_pokemon_name.slice(1)}
                </b>,<br/>
                weight of <b> {this.state.pokemon_weight} kg</b>, <br/>
                height of <b> {this.state.pokemon_height} m</b>, <br/>
                {this.state.pokemon_abilities && this.state.pokemon_abilities.length>0 && (
                  <>
                    with abilities <b>{this.state.pokemon_abilities.join(", ")}</b>, <br />
                  </>
                )}
                {this.state.pokemon_moves && this.state.pokemon_moves.length>0 && (
                  <>
                    with moves <b>{this.state.pokemon_moves.join(", ")}</b>, <br />
                  </>
                )}
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
              {this.state.message && (
                <div>
                  <Message floating id="message">{this.state.message}</Message>
                </div>)}
          </Grid.Column>
        </Grid>
      </>
    );
  }
}

export default UserProfilePage;
