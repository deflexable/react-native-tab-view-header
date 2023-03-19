import React from "react";
import { ScrollViewProps } from "react-native";
import { Animated, FlatListProps, SectionListProps } from "react-native";
import { TabViewProps } from "react-native-tab-view";

interface TabSlideProps {
    key: string;
    title: string;
    Wrapper: Animated.FlatList | Animated.SectionList;
    WrapperProps: FlatListProps<any> | SectionListProps<any>;
}

interface CollapsibleTabViewHeaderProps extends TabViewProps<any> {
    tabSlides: TabSlideProps[];
    tabBarHeight?: number;
    onIndexChange?: (i: number) => void;
    renderTabBar?: () => React.Component;
    renderHeader: () => React.Component;
    enableRefresh?: boolean; // TODO:
    renderRefreshComponent?: () => React.Component; // TODO:
    onRefresh?: () => void; // TODO:
    refreshDelay?: number; // TODO:
    tabIndex?: number;
    headerHeight?: number;
    onScrollY?: (offset: number) => void;
    tabBarStickyPosition?: number;
    onTabBarStickyChange?: (isSticky: boolean) => void;
    onHeaderHeightChanged?: (newHeight: number) => void;
    renderLabel?: () => React.Component;
    snapHeaderPosition?: number; // TODO:
}


export default class CollapsibleTabViewHeader extends React.Component<CollapsibleTabViewHeaderProps>{ }