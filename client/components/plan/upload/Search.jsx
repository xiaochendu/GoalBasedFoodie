import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

import {browserHistory} from 'react-router';
import {Col, Button, Form, FormControl} from 'react-bootstrap';
import _ from 'lodash';

import {setVenues} from '../../../actions/userActions';
import {callSearchApi} from '../../../actions/fourSquareVenueSearchActions';

@connect((store) => {
    return {
        data: store.search.data,
        err: store.search.err
    };
})

export default class Type extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedVenues: [],
            allVenues: [],
        }
    }

    componentWillMount() {
        const venue = {
                id: 1234,
                categories: "",
                name: "Enter Search",
                address: [""],
                distance: "",
                checkin: "",
                display: true,
            };
        this.setState({ allVenues: [venue]});
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.data);
        if (nextProps.data.length) {
            function mapVenues(venue) {
                const Venue = {
                    id: venue.id,
                    name: venue.name,
                    address: venue.location.formattedAddress,
                    distance: venue.location.distance,
                    checkin: venue.stats.checkinsCount,
                    display: true,
                }
                if (venue.categories.length) {
                    Venue.categories = venue.categories[0].shortName;
                }
                return Venue
            }
            const venues = nextProps.data
                .map(mapVenues);
            this.setState({ allVenues: venues }, console.log("Updated venues"));
        } else {
            const venue = {
                id: 1234,
                categories: "",
                name: "nothing found",
                address: [""],
                distance: "",
                checkin: "",
                display: true,
            }
            this.setState({ allVenues: [venue] }, console.log("Nothing found"));
        }
    }

    render() {
        const style = {
            display: "block",
            textAlign: "center"
        }

        return (
            <Col smOffset={3} sm={6} mdOffset={3} md={6} style={style}>
                    {this.state.selectedVenues.map(entry => <Button key={entry[0].id} disabled>{entry[0].name}</Button>)}
                    <Button onClick={this.generatePlan.bind(this)} ref="decrement"> I'm ready! </Button>
                    <Form inline>
                    <FormControl ref="placeQuery" placeholder="Start typing" />
                    <Button bsStyle="primary" onClick={this.search.bind(this)} ref="getPlaces">Search</Button>
                    </Form>


                    { _.filter(this.state.allVenues, { display: true})
                        .map(venue =>
                        (<div key={venue.id}>
                            <Col md={4}>
                                <p>Name: {venue.name}</p>
                                <p>Distance: {venue.distance}m</p>
                                <p>Address: {venue.address.map(part => <span>{part+" "}</span>)}</p>
                                <p>Check In: {venue.checkin}</p>
                                <p>Categories: {venue.categories}</p>
                            </Col>
                            <Col md={2}>
                                <Button onClick={this.addEntry.bind(this, venue.id)}>Add</Button>
                            </Col>
                        </div>)
                    )
                    }
            </Col>
        )
    }

    generatePlan(e) {
        e.preventDefault();
        this.props.dispatch(setVenues(this.state.selectedVenues));
        browserHistory.push('/upload/results');
    }

    addEntry(ref) {
        console.log(ref);
        console.log(this.state.allVenues);
        const venue = _(this.state.allVenues)
            .filter({ 'id' : ref })
            .value();
        console.log(venue);

        //show selected venue on top screen
        let prevVenues = this.state.selectedVenues.slice(0);
        prevVenues.push(venue);
        this.setState({ selectedVenues: prevVenues
            },
            console.log("after: ", this.state.selectedVenues)
        );

        //hide selected venue at bottom
        console.log("All venues:", this.state.allVenues);
        console.log("venue to find:", venue[0]);
        const index = _.findIndex(this.state.allVenues, venue[0]);
        console.log(index);
        const tempAllVenues = this.state.allVenues.slice(0);
        tempAllVenues[index]["display"] = false;
        this.setState({ allVenues: tempAllVenues},
            console.log(tempAllVenues)
        );
    }

    search() {
        const query = ReactDOM.findDOMNode(this.refs.placeQuery).value;
        this.props.dispatch(callSearchApi(query));
    }

}