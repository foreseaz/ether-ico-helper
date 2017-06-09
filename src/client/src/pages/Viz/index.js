import React, { Component } from 'react';
import _ from 'lodash';

import batData from '../../data/bat.json';

export default class Viz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addr: props.match.params.addr
    }

    _.bindAll(this, [
      'prepareData',
      'drawSankey',
    ]);
  }

  componentDidMount() {
    this.prepareData();
    if (window.google && window.google.charts) {
      window.google.charts.load('current', {'packages':['sankey']});
      window.google.charts.setOnLoadCallback(this.drawSankey);
    }
  }

  prepareData() {
    const batAddr = this.state.addr;
    const data = batData[batAddr];
    let sankeyArr = [];

    const l1Addrs = _.map(data, v1 => v1.address);
    console.log(l1Addrs);
    const l2Addrs = [];
    _.map(data, v1 => {
      _.map(v1.vendors, v2 => { l2Addrs.push(v2.address) });
    });
    console.log(l2Addrs);
    const l3Addrs = [];
    _.map(data, v1 => {
      _.map(v1.vendors, v2 => {
        _.map(v2.vendors, v3 => { l3Addrs.push(v3.address) });
      });
    });
    console.log(l3Addrs);

    _.map(data, (v1) => {
      sankeyArr.push([v1.address, batAddr, v1.amount])
      _.map(v1.vendors, (v2) => {
        sankeyArr.push([v2.address, v1.address, v2.amount])
        // _.map(v2.vendors, (v3) => {
        //   sankeyArr.push([v3.address, v2.address, v3.amount])
        // });
      });
    });

    // filter small tx
    sankeyArr = _.filter(sankeyArr, arr => arr[2] > 200);
    // drop circles
    // const circleIdx = [1,31,30,32,82,81];
    // circleIdx.map(i => sankeyArr.splice(i-1, 1));

    this.setState({ sankeyArr });
  }

  drawSankey() {
    var data = new window.google.visualization.DataTable();
    console.log(this.state.sankeyArr);
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'ETH');
    data.addRows(this.state.sankeyArr);

    // Sets chart options.
    var options = {
      width: 1000,
      height: 3000,
      sankey: {
        node: {
          label: { fontSize: 0 },
        }
      },
    };

    // Instantiates and draws our chart, passing in some options.
    var chart = new window.google.visualization.Sankey(document.getElementById('viz_sankey'));
    chart.draw(data, options);
  }

  render() {
    return (
      <div>
        <h1>Viz BAT ICO TX</h1>
        <div id="viz_sankey"></div>
      </div>
    )
  }
}
