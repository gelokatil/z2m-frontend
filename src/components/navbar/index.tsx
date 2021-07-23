import React, { FunctionComponent, RefObject, useRef, useState } from 'react';

import { GlobalState } from '../../store';
import actions, { ThemeActions } from '../../actions/actions';
import { connect } from 'unistore/react';
import Button from '../button';
import cx from "classnames";
import { Link, NavLink } from 'react-router-dom';
import useComponentVisible from '../../hooks/useComponentVisible';
import { Device } from '../../types';
import style from "./style.css";
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { BridgeApi } from '../../actions/BridgeApi';
import { ThemeSwitcher } from '../theme-switcher';
import { WithTranslation, withTranslation, useTranslation } from 'react-i18next';
import LocalePicker from '../../i18n/LocalePicker';



const urls = [
    {
        href: '/',
        key: 'devices',
        exact: true
    },
    {
        href: '/dashboard',
        key: 'dashboard'
    },
    {
        href: '/map',
        key: 'map'
    },
    {
        href: '/settings',
        key: 'settings'
    },
    {
        href: '/groups',
        key: 'groups'
    },
    {
        href: '/ota',
        key: 'ota'
    },
    {
        href: '/touchlink',
        key: 'touchlink'
    },
    {
        href: '/logs',
        key: 'logs'
    },
    {
        href: '/extensions',
        key: 'extensions'
    }
];
type StartStopJoinButtonProps = Pick<BridgeApi, 'setPermitJoin'> & Pick<GlobalState, 'bridgeInfo' | 'devices'>;

const StartStopJoinButton: FunctionComponent<StartStopJoinButtonProps> = ({ devices, setPermitJoin, bridgeInfo }) => {

    const { t } = useTranslation(['navbar']);
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
    const [selectedRouter, setSelectedRouter] = useState<Device>({} as Device);
    const { permit_join: permitJoin, permit_join_timeout: permitJoinTimeout } = bridgeInfo;
    const routers: JSX.Element[] = [];
    const selectAndHide = (device: Device) => { setSelectedRouter(device); setIsComponentVisible(false) }
    Object.values(devices).forEach((device) => {
        if (device.type == "Router") {
            routers.push(<li key={device.friendly_name}>
                <Button<Device> item={device} className="dropdown-item" onClick={selectAndHide}>{device.friendly_name}</Button>
            </li>)
        }
    });
    const onBtnClick = () => {
        setPermitJoin(!permitJoin, selectedRouter);
    }
    const permitJoinTimer = <>{permitJoinTimeout ? <div className="d-inline-block ms-1" style={{ width: '30px', maxWidth: '30px' }}> {permitJoinTimeout}</div> : null}</>;
    const buttonLabel = <>{permitJoin ? t("disable_join") : t("permit_join")} ({selectedRouter?.friendly_name ?? t("all")}){permitJoinTimer}</>;
    return (
        <div className="btn-group text-nowrap me-1">

            <button onClick={onBtnClick}
                type="button"
                className="btn btn-outline-secondary">{buttonLabel}</button>


            {routers.length ? (<><Button<boolean> type="button" onClick={setIsComponentVisible} item={!isComponentVisible} className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-expanded="false">
                <span className="visually-hidden">{t('toggle_dropdown')}</span>
            </Button>
                <ul ref={ref as RefObject<HTMLUListElement>} className={cx('dropdown-menu', style['scrollable-menu'], { show: isComponentVisible })}>
                    <li key='all'>
                        <Button className="dropdown-item" onClick={selectAndHide}>{t('all')}</Button>
                    </li>
                    {routers}
                </ul></>) : null}

        </div>
    );
}

type PropsFromStore = Pick<GlobalState, 'devices' | 'bridgeInfo'>;

const NavBar: FunctionComponent<PropsFromStore & ThemeActions & WithTranslation<'navbar'> & BridgeApi> = (props) => {
    const { devices, setPermitJoin, bridgeInfo, restartBridge, setTheme, t, i18n } = props;
    const ref = useRef<HTMLDivElement>();
    const [navbarIsVisible, setnavbarIsVisible] = useState<boolean>(false);
    useOnClickOutside(ref, () => {
        setnavbarIsVisible(false);
    });
    return (<nav className="navbar navbar-expand-md navbar-light">
        <div ref={ref as React.MutableRefObject<HTMLDivElement>} className="container-fluid">
            <Link onClick={() => setnavbarIsVisible(false)} to="/">Zigbee2MQTT</Link>

            <button onClick={() => { setnavbarIsVisible(!navbarIsVisible) }} className="navbar-toggler" type="button">
                <span className="navbar-toggler-icon" />
            </button>
            <div className={cx("navbar-collapse collapse", { show: navbarIsVisible })}>
                <ul className="navbar-nav">
                    {
                        urls.map(url =>
                            <li key={url.href} className="nav-item">
                                <NavLink onClick={() => setnavbarIsVisible(false)} exact={url.exact} className="nav-link" to={url.href} activeClassName="active">
                                    {t(url.key)}
                                </NavLink>
                            </li>)
                    }
                    <LocalePicker />
                </ul>
                <StartStopJoinButton
                    devices={devices}
                    setPermitJoin={setPermitJoin}
                    bridgeInfo={bridgeInfo}
                />
                <ThemeSwitcher saveCurrentTheme={setTheme} />

            </div>
            {bridgeInfo.restart_required ? <Button onClick={restartBridge} promt className="btn btn-danger me-1">{t('restart')}</Button> : null}
        </div>
    </nav>)
}
const mappedProps = ["bridgeInfo", "devices"];
const ConnectedNavBar = withTranslation("navbar")(connect<unknown, unknown, PropsFromStore, BridgeApi>(mappedProps, actions)(NavBar));
export default ConnectedNavBar;

