import React from 'react'

import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react'

import { Link } from "react-router-dom"

import firebase from '../../firebase';
import md5 from 'md5'
class Register extends React.Component {
	state = {
		fullName: '',
		email: '',
		username: '',
		phone: '',
		password: '',
		passwordConfirmation: '',
		errors: [],
		loading: false,
		usersRef: firebase.database().ref("users")
	}

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	isFormValid = () => {
		let errors = [];
		let error;
		if (this.isFormEmpty(this.state)) {
			error = { message: "Fill all the fields" };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else if (!this.isPasswordValid(this.state)) {
			error = { message: "Password is invalid" };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else {
			return true;
		}
	}

	isFormEmpty = ({ username, email, password, passwordConfirmation, phone, fullName }) => {
		return (
			!username.length ||
			!email.length ||
			!password.length ||
			!phone.length ||
			!fullName.length ||
			!passwordConfirmation.length);
	}

	isPasswordValid = ({ password, passwordConfirmation }) => {
		if (password.length < 6 || passwordConfirmation.length < 6) {
			return false;
		} else if (password !== passwordConfirmation) {
			return false;
		} else {
			return true;
		}
	}

	displayErrors = errors =>
		errors.map((error, i) => <p key={i}>{error.message}</p>);

	handleSubmit = (event) => {
		event.preventDefault();
		if (this.isFormValid()) {
			this.setState({
				errors: [],
				loading: true
			});
			firebase
				.auth()
				.createUserWithEmailAndPassword(this.state.email, this.state.password)
				.then(createdUser => {
					console.log(createdUser);
					createdUser.user
						.updateProfile({
							displayName: this.state.fullName,
							phoneNumber: this.state.phone,
							photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
						})
						.then(() => {
							this.saveUser(createdUser).then(() => {
								console.log("User saved");
							});
						})
						.catch(err => {
							console.error(err);
							this.setState({
								errors: this.state.errors.concat(err),
								loading: false
							});
						});
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

	saveUser = createdUser => {
		return this.state.usersRef.child(createdUser.user.uid).set({
			name: createdUser.user.displayName,
			avatar: createdUser.user.photoURL
		});
	}

	handleInputError = (errors, inputName) => {
		return errors.some(error =>
			error.message.toLowerCase().includes(inputName)
		)
			?
			'error'
			:
			''
	}
	render() {
		const { fullName, email, username, phone, password, passwordConfirmation, errors, loading } = this.state;

		return (
			<div>
				<Grid textAlign="center" verticalAlign='middle' className="app">
					<Grid.Column style={{ maxWidth: 450 }}>
						<Header as="h2" icon textAlign="center">
							<Icon name="user" />
                            Register for React Slack Ha
                        </Header>
						<Form onSubmit={this.handleSubmit} size="large">
							<Segment stacked>
								<Form.Input
									fluid
									type="text"
									name="fullName"
									icon="user"
									iconPosition="left"
									placeholder="Full Name"
									className={this.handleInputError(errors, 'fullName')}
									value={fullName}
									onChange={this.handleChange} />
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
									type="text"
									name="username"
									icon="user"
									iconPosition="left"
									placeholder="Username"
									className={this.handleInputError(errors, 'username')}
									value={username}
									onChange={this.handleChange} />
								<Form.Input
									fluid
									type="number"
									name="phone"
									icon="phone"
									iconPosition="left"
									placeholder="Phone Number"
									className={this.handleInputError(errors, 'phone')}
									value={phone}
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
								<Form.Input
									fluid
									type="password"
									name="passwordConfirmation"
									icon="repeat"
									iconPosition="left"
									value={passwordConfirmation}
									className={this.handleInputError(errors, 'passwordConfirmation')}
									placeholder="Password Confirmation"
									onChange={this.handleChange} />
								<Button disabled={loading} className={loading ? 'loading' : ''} color="olive" fluid size="large">Submit</Button>
							</Segment>
						</Form>
						{errors.length > 0 && (
							<Message error>
								{this.displayErrors(errors)}
							</Message>
						)}
						<Message>Already a user ? <Link to="/login">Login</Link></Message>
					</Grid.Column>

				</Grid>
			</div>
		)
	}
}
export default Register;
