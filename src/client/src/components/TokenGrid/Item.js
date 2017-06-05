import React from 'react';
import { Image, Card, Icon, Segment, Label } from 'semantic-ui-react';
import './Item.css'

const Item = ({token}) => (
  <Card href='#token-address' className="_card">
    <Image src='/imgs/eth_ico.png' />
    <Card.Content>
      <Card.Header>
        {token.name}
      </Card.Header>
      <Card.Meta>
        <a href={token.official_website}>{token.symbol}</a> <br />
        <span className='date'>
          {token.start_time} - {token.end_time}
        </span>
      </Card.Meta>
      <Card.Description>
        {token.description}
      </Card.Description>
    </Card.Content>
    <Card.Content extra>
      <a>
        <Icon name='heart' />
        {Math.floor(Math.random() * 200) + 1  } Follows
      </a>
    </Card.Content>
  </Card>
);

export default Item;
