import React from 'react'
import ReactEcharts from 'echarts-for-react'

const PlasticOceanBeachChart = () => {
  const getOption = () => {
    return {
      title: {
        text: 'Mismanaged plastic reaching ocean and beaches (tonnes)',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} tonnes ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: ['Ends up in beaches', 'Ends up in the ocean'],
      },
      series: [
        {
          name: 'Plastic distribution',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%',
            color: '#fff',
            fontSize: 14,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: 75,
              name: 'Ends up in beaches',
              itemStyle: { color: '#ffc107' },
            },
            {
              value: 25,
              name: 'Ends up in the ocean',
              itemStyle: { color: '#007bff' },
            },
          ],
        },
      ],
    }
  }

  return (
    <ReactEcharts
      option={getOption()}
      style={{ height: '400px', width: '100%' }}
    />
  )
}

export default PlasticOceanBeachChart
