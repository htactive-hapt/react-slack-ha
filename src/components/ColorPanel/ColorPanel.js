import React from 'react'
import firebase from '../../firebase'
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react'
import { SliderPicker } from 'react-color'
class ColorPanel extends React.Component {
	state = {
		modal: false,
		primary: '',
		secondary: '',
		user: this.props.currentUser,
		usersRef: firebase.database().ref('users'),
		userColors: [],
	}

	componentDidMount() {
		if(this.state.user) {
			this.addListener(this.state.user.uid);
		}
	};

	addListener = userId => {
		let userColors = [];
		this.state.usersRef
		.child(`${userId}/color`)
		.on("child_added", snap => {
			userColors.unshift(snap.val());
			this.setState({userColors})
		})

	}


	openModal = () => {
		this.setState({ modal: true });
	};

	closeModal = () => {
		this.setState({ modal: false });
	};

	handleChanePrimary = color => this.setState({ primary: color.hex });

	handleChaneSecondary = color => this.setState({ secondary: color.hex });

	handleSaveColors = () => {
		if (this.state.primary && this.state.secondary) {
			this.saveColors(this.state.primary, this.state.secondary);
		}
	}

	saveColors = (primary, secondary) => {
		this.state.usersRef
			.child(`${this.state.user.uid}/colors`)
			.push()
			.update({
				primary,
				secondary
			})
			.then(() => {
				console.log("Color added");
				this.closeModal();
			})
			.catch(err => console.log(err))
	}

	displayUserColor = colors => (
		colors.length > 0 && colors.map((color, i) => (
			<React.Fragment key={i}>
				<Divider/>
				<div className="color__container">
					<div className="color_square" style={{background: color.primary}}>
						<div className="color_overlay" style={{background: color.secondary}}>

						</div>
					</div>
				</div>
			</React.Fragment>
		))
	)

	render() {
		const { modal, primary, secondary, userColors } = this.state;

		return (
			<Sidebar
				as={Menu}
				icon="labeled"
				inverted
				vertical
				visible
				width="very thin"
			>
				<Divider />
				<Button icon="add" size="small" color="blue" onClick={this.openModal} />
				{this.displayUserColor(userColors)}
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>
						Choose app color
					</Modal.Header>
					<Modal.Content>
						<Segment inverted>
							<Label content="Primary Color" />
							<SliderPicker color={primary} onChange={this.handleChanePrimary} />
						</Segment>
						<Segment inverted>
							<Label content="Secondary Color" />
							<SliderPicker color={secondary} onChange={this.handleChaneSecondary} />
						</Segment>
					</Modal.Content>
					<Modal.Actions>
						<Button color="green" inverted onClick={this.handleSaveColors}><Icon name="checkmark" />Save Color</Button>
						<Button color="red" onClick={this.closeModal} inverted><Icon name="remove" /> Cancel</Button>
					</Modal.Actions>
				</Modal>
			</Sidebar>
		)
	}
}

export default ColorPanel;