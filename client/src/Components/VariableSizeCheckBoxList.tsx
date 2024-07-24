import { VariableSizeList as List } from 'react-window';
import { FormControlLabel, Checkbox } from '@mui/material';

const VariableSizeCheckboxList = ({ items, onChange, checkedItems }) => {
  // Row component to render each checkbox
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checkedItems.get(item)}
              onChange={(event) => onChange(item, event.target.checked)}
              name={item}
            />
          }
          label={item}
        />
      </div>
    );
  };

  // Determine the height of each row
  const getItemSize = () => 48; // Adjust item size as needed

  return (
    <List
      height={Math.min(300,(items.length * getItemSize()))}   // Adjust height as needed
      itemCount={items.length}
      itemSize={getItemSize}
      width={300}     // Adjust width as needed
    >
      {Row}
    </List>
  );
};

export default VariableSizeCheckboxList;
