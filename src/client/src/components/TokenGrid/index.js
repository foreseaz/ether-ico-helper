import React from 'react';
import _filter from 'lodash/filter';
import { Grid, Image, Card, Icon, Divider } from 'semantic-ui-react';
import Item from './Item';
import tokens from '../../data/tokens.json';
import './TokenGrid.css';

const TokenGrid = () => {
  return (
    <div id="results" className="_tokenGrid">
      <Divider id="ongoing" horizontal><Icon name='checked calendar' /> Ongoing</Divider>
      <Grid doubling columns={5}>
        {_filter(tokens, t => t.status === 'Trading').map(token => (
          <Grid.Column key={token.symbol}>
            <Item token={token}/>
          </Grid.Column>
        ))}
      </Grid>
      <Divider id="incoming" horizontal><Icon name='send' /> In-Coming</Divider>
      <Grid doubling columns={5}>
        {_filter(tokens, t => t.status === 'ICO coming').map(token => (
          <Grid.Column key={token.symbol}>
            <Item token={token}/>
          </Grid.Column>
        ))}
      </Grid>
      <Divider id="past" horizontal><Icon name='wait' /> Ended</Divider>
      <Grid doubling columns={5}>
        {_filter(tokens, t => t.status === 'ICO over').map(token => (
          <Grid.Column key={token.symbol}>
            <Item token={token}/>
          </Grid.Column>
        ))}
      </Grid>
    </div>
  )
}

export default TokenGrid;
