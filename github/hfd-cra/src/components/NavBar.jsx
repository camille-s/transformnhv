import React from 'react';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';

const NavBar = (props) => (
	<Menu inverted fixed="top" stackable>
		<Menu.Item name="brand">Hartford Dashboard</Menu.Item>
		<Menu.Item as="a" href="/" name="home" icon="chevron left" />
		<Menu.Menu>
			<Dropdown item text="Sectors">
				<Dropdown.Menu>
					<Dropdown.Item>Early childhood</Dropdown.Item>
					<Dropdown.Item>Economic development</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
		</Menu.Menu>
	</Menu>
);

export default NavBar;
