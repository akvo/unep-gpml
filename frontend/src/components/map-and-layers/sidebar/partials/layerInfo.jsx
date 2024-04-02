import React from "react";
import { Button, Card, Typography } from "antd";
import styled from "styled-components";

const { Title: AntTitle, Paragraph: AntParagraph } = Typography;

// const Title = styled(AntTitle)`
//   color: #09334b;
// `;

// const Paragraph = styled(AntParagraph)`
//   color: #09334b;
// `;

// const CustomCard = styled(Card)`
//   display: flex;
//   flex-direction: column;
//   box-sizing: border-box;
//   border: none;
//   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
// `;

// const LayoutWrapper = styled.div`
//   display: flex;
//   flex-direction: row;
//   width: 800px;
//   margin: auto;
//   background-color: white;
// `;

// const StyledButton = styled(Button)`
//   border-color: #09334b;
//   color: #09334b;

//   &:hover,
//   &:focus {
//     border-color: #09334b;
//     color: #09334b;
//   }
// `;

const LayerInfo = ({ layer }) => {
  const handleReadMoreClick = () => {
    window.open(layer.attributes.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
        <Card>
        <AntTitle level={3}>{layer?.attributes.title}</AntTitle>
        <AntParagraph>{layer.attributes.shortDescription}</AntParagraph>
        <Button
          type="link"
          onClick={handleReadMoreClick}
          style={{ border: "1px solid #09334B", padding: "0 8px" }}
        >
          Read More
        </Button>
      </Card>

      <Card>
        <AntParagraph>
          <strong>Time Period:</strong> {layer?.attributes.timePeriod}
        </AntParagraph>
        <AntParagraph>
          <strong>Data Source:</strong> {layer?.attributes.dataSource}
        </AntParagraph>
        <AntParagraph>
          <strong>URL:</strong> {layer?.attributes.url}
        </AntParagraph>
      </Card>
    </div>
  );
};

export default LayerInfo;
