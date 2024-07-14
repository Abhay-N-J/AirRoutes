import * as React from 'react';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import { useTheme, styled } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '@mui/material/Typography';
import { CircularProgress, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

type Props = {
  queryKey: string,
  queryFn: () => Promise<any>,
  getOptionLabel: (option: any) => string,
  onChange: React.Dispatch<React.SetStateAction<any>>,
  label: string
};

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  if (Object.prototype.hasOwnProperty.call(dataSet, 'group')) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  const { key, ...optionProps } = dataSet;
  
  return (
    <Typography key={key} component="li" {...optionProps.props} noWrap style={inlineStyle}>
      {`${dataSet.props.children}`}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactElement[] = [];
  (children as React.ReactElement[]).forEach(
    (item: React.ReactElement & { children?: React.ReactElement[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    },
  );
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactElement) => {
    if (Object.prototype.hasOwnProperty.call(child, 'group')) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

export default function SearchBox(props: Props) {
  const [open, setOpen] = useState(false);
  const { isLoading, isError, data, error } = useQuery({
    queryKey: [props.queryKey],
    queryFn: props.queryFn,
    staleTime: 3600000,
  });

  const loading = (isLoading || data == null) && open;

  return (
    <Autocomplete
      disablePortal
      disableListWrap
      id="search-box"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={data || []}
      sx={{ width: 300 }}
      ListboxComponent={ListboxComponent}
      PopperComponent={StyledPopper}
      getOptionLabel={props.getOptionLabel}
      onChange={(_, value) => props.onChange(value)}
      renderInput={(params) => 
        <TextField
          {...params}
          className='text-white'
          label={isError ? error.message : props.label}
          disabled={isError}
          // focused
          sx={{ input: {color: 'white'}}}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      }
    />
  );
}
