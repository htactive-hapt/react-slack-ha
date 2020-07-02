import React from 'react'
import firebase from '../../firebase'
import uuidv4 from 'uuid/v4'
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from './FileModal'
class MessagesForm extends React.Component {
	state = {
		storageRef = firebase.storage().ref(),
		uploadTask: null,
		uploadState: '',
		percentUploaded: 0,
		message: '',
		channel: this.props.currentChannel,
		loading: false,
		user: this.props.currentUser,
		errors: [],
		modal: false,
	}

	openModal = () => {
		this.setState({ modal: true })
	};

	closeModal = () => {
		this.setState({ modal: false })
	}

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value })
	};

	createMessage = () => {
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			},
			content: this.state.message
		};
		return message
	}

	sendMessage = () => {
		const { messagesRef } = this.props;
		const { message, channel } = this.state
		if (message) {
			this.setState({ loading: true })
			messagesRef
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: '', errors: [] })
				})
				.catch(err => {
					console.log(err);
					this.setState({
						loading: false,
						errors: this.state.errors.concat(err)
					})
				})
		} else {
			this.setState({
				errors: this.state.errors.concat({ message: "Add a message" })
			})
		}

	}

	uploadFile = (file, metadata) => {
		console.log(file, metadata);
		const pathToUpload = this.state.channel.id;
		const ref = this.state.messagesRef;
		const filePath = `chat/public/${uuidv4()}.jpg`
		this.setState({
			uploadState: 'uploading',
			uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
		},
			() => {
				this.state.uploadTask.on('state_changed', snap => {
					const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
					this.setState({ percentUploaded });
				},
					err => {
						console.error(err);
						this.setState({
							errors: this.state.errors.concat(err),
							uploadState: 'error',
							uploadTask: null
						})
					},
					() => {
						this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
							this.sendFileMessage(downloadUrl, ref, pathToUpload);
						})
							.catch(err => {
								console.error(err);
								this.setState({
									errors: this.state.errors.concat(err),
									uploadState: 'error',
									uploadTask: null
								})
							})
					})
			})
	}

	sendFileMessage = (fileUrl, ref, pathToUpload) => {
		ref.child(pathToUpload)
		.push()
		.set(this.createMessage(fileUrl))
	}

	render() {
		const { errors, message, loading, modal } = this.state;
		return (
			<Segment className="message__form">
				<Input
					fluid
					name="message"
					style={{ marginBottom: '0.7em' }}
					label={<Button icon={'add'} />}
					labelPosition="left"
					value={message}
					onChange={this.handleChange}
					className={
						errors.some(error => error.message.includes('message')) ? 'error' : ''
					}
					placeholder="Type your message"
				/>
				<Button.Group icon widths="2">
					<Button
						color="orange"
						content="Add reply"
						labelPosition="left"
						disabled={loading}
						icon="edit"
						onClick={this.sendMessage}
					/>
					<Button
						color="teal"
						onClick={this.openModal}
						content="Upload media"
						labelPosition="right"
						icon="cloud upload"
					/>
					<FileModal
						modal={modal}
						closeModal={this.closeModal}
						uploadFile={this.uploadFile}
					/>
				</Button.Group>
			</Segment>
		)
	}
}

export default MessagesForm;
