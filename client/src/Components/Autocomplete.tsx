import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import React from 'react';

type Props = {
    onChange: React.Dispatch<React.SetStateAction<any>>
    options: unknown[],
    getOptionLabel: (option: any) => string,
    label: string
};

export default function SearchBox(props: Props) {
  return (
    <Autocomplete
      disablePortal
      id="search-box"
      options={props.options}
      sx={{ width: 300 }}
      getOptionLabel={props.getOptionLabel}
      onChange={(_, value) => props.onChange(value)}
      renderInput={(params) => <TextField {...params} label={props.label}/>}
    />
  );
}

