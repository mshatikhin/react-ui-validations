// @flow
/* eslint-disable import/no-dynamic-require, prefer-template */
import * as React from "react";
import PropTypes from "prop-types";
import ReactUiDetection from "../ReactUiDetection";

// $FlowFixMe we use define plugin
const Tooltip2 = require(REACT_UI_PACKAGE + "/components/Tooltip");
const Tooltip = requireDefault(Tooltip2);

function requireDefault<T>(obj: T): T {
    // $FlowFixMe default is a same module
    return obj && obj.__esModule ? obj.default : obj // eslint-disable-line
}

type ValidationTooltipProps = {
    children?: any,
    type?: "simple" | "lostfocus",
    error: boolean,
};

type ValidationTooltipState = {
    opened: boolean,
};

export default class ValidationTooltip extends React.Component<ValidationTooltipProps, ValidationTooltipState> {
    state: ValidationTooltipState = {
        opened: false,
    };

    static contextTypes = {
        validationTooltipContext: PropTypes.any,
    };

    componentWillReceiveProps(nextProps: ValidationTooltipProps) {
        if (this.props.error !== nextProps.error) {
            this.context.validationTooltipContext.errorStateUpdated(this, this.props.error, nextProps.error);
        }
    }

    componentWillMount() {
        if (this.context.validationTooltipContext) {
            this.context.validationTooltipContext.registerInstance(this);
        }
    }

    componentWillUnmount() {
        if (this.context.validationTooltipContext) {
            this.context.validationTooltipContext.unregisterInstance(this);
        }
    }

    setOpened(opened: boolean) {
        if (this.state.opened !== opened) {
            this.setState({
                opened: opened,
            });
        }
    }

    getBoxDomElement(): Element {
        // eslint-disable-next-line no-underscore-dangle
        return this.refs.tooltip._hotspotDOM;
    }

    handleFocus() {
        this.context.validationTooltipContext.instanceFocus(this);
    }

    handleBlur() {
        this.context.validationTooltipContext.instanceBlur(this);
    }

    handleMouseOver() {
        this.context.validationTooltipContext.instanceMouseOver(this);
    }

    handleMouseOut() {
        this.context.validationTooltipContext.instanceMouseOut(this);
    }

    render(): React.Node {
        const { children, ...props } = this.props;
        const onlyChild = React.Children.only(children);
        const childProps: any = {
            onFocus: (...args: *[]) => {
                this.handleFocus();
                if (onlyChild.props.onFocus) {
                    onlyChild.props.onFocus(...args);
                }
            },
            onBlur: (...args: *[]) => {
                this.handleBlur();
                if (onlyChild.props.onBlur) {
                    onlyChild.props.onBlur(...args);
                }
            },
            onMouseEnter: () => this.handleMouseOver(),
            onMouseLeave: () => this.handleMouseOut(),
        };
        if (ReactUiDetection.isRadioGroup(onlyChild)) {
            const prevRenderItem = onlyChild.props.renderItem;
            const items = onlyChild.props.items;
            childProps.renderItem = (value, data, ...rest) => {
                if (items[0] === value) {
                    return (
                        <Tooltip
                            ref="tooltip"
                            {...props}
                            closeButton={false}
                            trigger={this.props.error && this.state.opened ? "opened" : "closed"}>
                            {React.cloneElement(prevRenderItem(value, data, ...rest))}
                        </Tooltip>
                    );
                }
                return prevRenderItem(value, data, ...rest);
            };
            return React.cloneElement(onlyChild, childProps);
        }
        return (
            <Tooltip
                ref="tooltip"
                {...props}
                closeButton={false}
                trigger={this.props.error && this.state.opened ? "opened" : "closed"}>
                {React.cloneElement(onlyChild, childProps)}
            </Tooltip>
        );
    }
}
