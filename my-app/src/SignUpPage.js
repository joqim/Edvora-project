import { Form, Grid, Button, Header, Segment, Message, Image } from 'semantic-ui-react'
import { Component } from 'react'
import axios from 'axios'

class SignUpPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      password: "",
      reenteredPassword: "",
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

  handleSignUp = () => {
    if(this.state.email && this.state.username && (this.state.password === this.state.reenteredPassword)) {
      console.log('sending values to backend signup')
      axios.post('/sign_up',{
        email: this.state.email,
        password: this.state.password,
        username: this.state.username
      })
      .then(response => {
        console.log(response, 'response')
        if(response.status === 200){
          this.setState({
            ...this.state,
            error: false,
            message: "Sign up successful"
          }, () => {
            setTimeout(function() {
              document.location.href = "/"
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
    console.log('state in Signup', this.state)
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' textAlign='center'>
            Sign up
          </Header>
          <Form size='large' error={this.state.error}>
            <Segment stacked>
              <Form.Input
                name="username"
                fluid
                icon='user' 
                iconPosition='left'
                placeholder='Username'
                onChange={this.handleChange}
                required
                error={this.state.error}
              />
              <Form.Input
                name="email"
                fluid 
                icon='mail' 
                iconPosition='left' 
                placeholder='E-mail address'
                onChange={this.handleChange}
                required
                error={this.state.error}
              />
              <Form.Input
                name="password"
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Password'
                type='password'
                onChange={this.handleChange}
                required
                error={this.state.error}
              />
              <Form.Input
                name="reenteredPassword"
                fluid
                icon='lock'
                iconPosition='left'
                placeholder='Re-enter Password'
                type='password'
                onChange={this.handleChange}
                required
                error={this.state.error}
              />
              <Button primary fluid size='large' onClick={this.handleSignUp}>
                Sign Up
              </Button>
            </Segment>
          </Form>
          {this.state.message && (<Message floating>{this.state.message}</Message>)}
          <Message>
            Already have an account? <a href='/'>Login</a>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default SignUpPage;
