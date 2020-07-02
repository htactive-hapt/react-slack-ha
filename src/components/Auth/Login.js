import React from 'react'

import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react'

import { Link } from "react-router-dom"
import firebase from '../../firebase'
class Login extends React.Component {
	state = {
		email: '',
		password: '',
		errors: [],
		loading: false
	};

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	displayErrors = errors =>
		errors.map((error, i) => <p key={i}>{error.message}</p>);

	handleSubmit = event => {
		event.preventDefault();
		if (this.isFormValid(this.state)) {
			this.setState({
				errors: [],
				loading: true
			});
			firebase
				.auth()
				.signInWithEmailAndPassword(this.state.email, this.state.password)
				.then(signedInUser => {
					console.log(signedInUser);
				})
				.catch(err => {
					console.error(err);
					this.setState({
						errors: this.state.errors.concat(err),
						loading: false
					});
				});
		}
	}

	isFormValid = ({ email, password }) => email && password;

	handleInputError = (errors, inputName) => {
		return errors.some(error =>
			error.message.toLowerCase().includes(inputName)
		)
			?
			'error'
			:
			'';
	}
	render() {
		const { email, password, errors, loading } = this.state;

		return (
			<div>
				<Grid textAlign="center" verticalAlign='middle' className="app">
					<Grid.Column style={{ maxWidth: 450 }}>
						<Header as="h2" icon textAlign="center">
							<Icon name="user" />
                            Login to React Slack Ha
                        </Header>
						<Form onSubmit={this.handleSubmit} size="large">
							<Segment stacked>
								<Form.Input
									fluid
									type="email"
									name="email"
									icon="mail"
									iconPosition="left"
									placeholder="Email Address"
									className={this.handleInputError(errors, 'email')}
									value={email}
									onChange={this.handleChange} />
								<Form.Input
									fluid
									type="password"
									name="password"
									icon="lock"
									iconPosition="left"
									placeholder="Password"
									className={this.handleInputError(errors, 'password')}
									value={password}
									onChange={this.handleChange} />
								<Button disabled={loading} className={loading ? 'loading' : ''} color="olive" fluid size="large">Submit</Button>
							</Segment>
						</Form>
						{errors.length > 0 && (
							<Message error>
								{this.displayErrors(errors)}
							</Message>
						)}
						<Message>Don't have an acount ? <Link to="/register">Register</Link></Message>
					</Grid.Column>

				</Grid>
			</div>
		)
	}
}
export default Login;
