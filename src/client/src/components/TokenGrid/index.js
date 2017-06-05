import React from 'react';
import { Grid, Image, Card, Icon } from 'semantic-ui-react';
import Item from './Item';
import tokens from '../../data/tokens.json';
import './TokenGrid.css';

const TokenGrid = () => {
  return (
    <div className="_tokenGrid">
      <Grid doubling columns={5}>
        {tokens.map(token => (
          <Grid.Column>
            <Item token={token}/>
          </Grid.Column>
        ))}
      </Grid>
    </div>
  )
}

export default TokenGrid;
