import { Form, Grid, Button, Header, Segment, Message, Image } from 'semantic-ui-react'
import { Component } from 'react'
import axios from 'axios'
import { fetchToken, setToken } from "./Auth"

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      error: false,
      message: ""
    }
  }

  handleChange = (e) => {
    this.setState({
      ...this.state,
      [e.target.name]: e.target.value,
      error: false,
      message: ""
    })
  }

  handleLogin = () => {
    if(this.state.email && this.state.password) {
      console.log('sending values to backend - login')
      axios.post('/login',{
        email: this.state.email,
        password: this.state.password
      })
      .then(response => {
        console.log(response, 'response')
        if(response.status === 200 && response.data.token){
          setToken(this.state.email, response.data.token)
          this.setState({
            ...this.state,
            error: false,
            message: "Logged in"
          }, () => {
            setTimeout(function() {
              document.location.href = "/user_profile"
            }, 500)
          })
        }
      })
    } else {
      this.setState({
        ...this.state,
        error: true,
        message: "Form values invalid"
      })
    }
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' textAlign='center'>
            Login
          </Header>
          <Form size='large'>
            <Segment stacked>
              <Form.Input
                error={this.state.error}
                name="email"
                fluid 
                icon='user' 
                iconPosition='left' 
                placeholder='E-mail address'
                onChange={this.handleChange}
              />
              <Form.Input
                error={this.state.error}
                name="password"
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password'
                onChange={this.handleChange}
              />
              <Button primary fluid size='large' onClick={this.handleLogin}>
                Login
              </Button>
            </Segment>
          </Form>
          {this.state.message && (<Message floating>{this.state.message}</Message>)}
          <Message>
            New to us? <a href='/sign_up'>Sign up</a>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default LoginPage;
