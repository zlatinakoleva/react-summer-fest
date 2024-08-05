import './TicketsAndProgram.scss'
import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Map from '../contact/map/Map';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TicketsAndProgram() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <section className="section-about-tabs">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h1>Details About the Event</h1> 
                        </div>

                        <div className="section__body">
                            <div className="tabs">
                                <Tabs className="tabs__nav" value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Program" {...a11yProps(0)} />
                                    <Tab label="Tickets" {...a11yProps(1)} />
                                    <Tab label="Location" {...a11yProps(2)} />
                                </Tabs>
                                <div className="tabs__body">
                                    <CustomTabPanel className="tab" value={value} index={0}>
                                        <div className="widget-dates">
                                            <ul>
                                                <li>
                                                    <div className="dateline">
                                                        <div className="dateline__date">
                                                            <h4>10<br />August</h4>
                                                            <h5>20:30</h5>
                                                        </div>

                                                        <div className="dateline__body">
                                                            <h5>Title</h5>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, voluptatibus?</p>
                                                        </div>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="dateline">
                                                        <div className="dateline__date">
                                                            <h4>10<br />August</h4>
                                                            <h5>20:30</h5>
                                                        </div>

                                                        <div className="dateline__body">
                                                            <h5>Title</h5>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, voluptatibus?</p>
                                                        </div>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="dateline">
                                                        <div className="dateline__date">
                                                            <h4>10<br />August</h4>
                                                            <h5>20:30</h5>
                                                        </div>

                                                        <div className="dateline__body">
                                                            <h5>Title</h5>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, voluptatibus?</p>
                                                        </div>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="dateline">
                                                        <div className="dateline__date">
                                                            <h4>10<br />August</h4>
                                                            <h5>20:30</h5>
                                                        </div>

                                                        <div className="dateline__body">
                                                            <h5>Title</h5>
                                                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam, voluptatibus?</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </CustomTabPanel>
                                    <CustomTabPanel className="tab" value={value} index={1}>
                                        <div className="widget-prices">
                                            <ul>
                                                <li>
                                                    <div className="price bg-primary">
                                                        <h4>Single</h4>
                                                        <h1>$120</h1>
                                                        <p>1 Day Pass</p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="price price bg-blue-200">
                                                        <h4>Double</h4>
                                                        <h1>$200</h1>
                                                        <p>2 Days Pass</p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="price price bg-blue-300">
                                                        <h4>Pro</h4>
                                                        <h1>$300</h1>
                                                        <p>3 Days Pass</p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="price price bg-secondary">
                                                        <h4>Ultra</h4>
                                                        <h1>$400</h1>
                                                        <p>All Days Pass</p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </CustomTabPanel>
                                    <CustomTabPanel className="tab" value={value} index={2}>
                                        <Map />
                                    </CustomTabPanel>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}