import React, { useEffect, useRef, useState } from "react";
import { Dimensions, PanResponder, StyleSheet, Text } from "react-native";
import { Animated, Platform, View } from "react-native"
import { TabBar, TabView } from "react-native-tab-view";

const WINDOW_WIDTH = Dimensions.get('window').width;
const TabBarHeight = 40;
const PullToRefreshDist = 150;

const ExceptionalProps = ['tabSlides', 'onIndexChange', 'onSwipeStart', 'onSwipeEnd', 'renderTabBar', 'renderHeader', 'renderRefreshComponent', 'enableRefresh', 'onRefresh', 'refreshDelay', 'tabIndex', 'children', 'key', 'headerHeight', 'onScrollY', 'tabBarStickyPosition', 'onTabBarStickyChange', 'onHeaderHeightChanged', 'renderLabel', 'tabBarHeight'];

const CollapsibleTabViewHeader = (props) => {

    const { tabSlides = [], onIndexChange, onSwipeStart, onSwipeEnd, renderTabBar, renderHeader, renderRefreshComponent, onRefresh, refreshDelay = 2000, tabIndex: selectedIndex = 0, headerHeight: headerHeightX, onScrollY, tabBarStickyPosition = 0, onTabBarStickyChange, onHeaderHeightChanged, renderLabel, tabBarHeight: tabBarHeightX } = props;

    const enableRefresh = false;

    const routes = tabSlides.map(v => ({ key: v.key, title: v.title }));

    const [tabIndex, setIndex] = useState(selectedIndex),
        [__, setCanScroll] = useState(true),
        [headerHeight, setHeight] = useState(headerHeightX || 0),
        [tabBarHeight, setTabBarHeight] = useState((renderTabBar ? tabBarHeightX : TabBarHeight) || 0),
        [gottenHeaderHeight, setGottenHeaderHeight] = useState(headerHeightX != null),
        [gottenTabBarHeight, setGottenTabBarHeight] = useState(tabBarHeightX != null || !renderTabBar),
        [_, refreshState] = useState();

    const scrollY = useRef(new Animated.Value(0)).current,
        headerScrollY = useRef(new Animated.Value(0)).current,
        headerMoveScrollY = useRef(new Animated.Value(0)).current,
        listRefArr = useRef([]),
        listOffset = useRef({}),
        isListGliding = useRef(false),
        headerScrollStart = useRef(0),
        _tabIndex = useRef(0),
        refreshStatusRef = useRef(false),
        emittingTabIndex = useRef();

    useEffect(() => {
        if (headerHeight !== headerHeightX)
            onHeaderHeightChanged?.(headerHeight);
    }, [headerHeight]);

    useEffect(() => {
        if (selectedIndex !== tabIndex) {
            if (emittingTabIndex.current) {
                onIndexChange?.(tabIndex);
            } else {
                _tabIndex.current = selectedIndex;
                setIndex(selectedIndex);
            }
        }
        emittingTabIndex.current = false;
    }, [tabIndex]);

    const headerPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
            onStartShouldSetPanResponder: (evt, gestureState) => {
                headerScrollY.stopAnimation();
                syncScrollOffset();
                return false;
            },

            onMoveShouldSetPanResponder: (evt, gestureState) => {
                headerScrollY.stopAnimation();
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderEnd: (evt, gestureState) => {
                handlePanReleaseOrEnd(evt, gestureState);
            },
            onPanResponderMove: (evt, gestureState) => {
                const curListRef = listRefArr.current.find(
                    (ref) => ref.key === routes[_tabIndex.current].key,
                );
                const headerScrollOffset = - gestureState.dy + headerScrollStart.current;
                if (curListRef.value) {
                    // scroll up
                    if (headerScrollOffset > 0) {
                        scrollToPosition(curListRef.value, headerScrollOffset);
                    } else {
                        if (Platform.OS === 'ios') {
                            scrollToPosition(curListRef.value, headerScrollOffset / 3);
                        } else if (Platform.OS === 'android') {
                            if (!refreshStatusRef.current) {
                                headerMoveScrollY.setValue(headerScrollOffset / 1.5);
                            }
                        }
                    }
                }
            },
            onShouldBlockNativeResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                headerScrollStart.current = scrollY._value;
            },
        }),
    ).current;

    const scrollToPosition = (ref, offset, animated = false) => {
        // try {
        ref.scrollToOffset({
            offset,
            animated,
        });
        // } catch (e) {
        //     ref.scrollTo({
        //         x: offset,
        //         animated,
        //     });
        // }
    }

    const listPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => false,
            onStartShouldSetPanResponder: (evt, gestureState) => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                headerScrollY.stopAnimation();
                return false;
            },
            onShouldBlockNativeResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                headerScrollY.stopAnimation();
            },
        }),
    ).current,
        hasSnapTabBar = useRef(false);

    useEffect(() => {
        scrollY.addListener(({ value }) => {
            const curRoute = routes[tabIndex].key,
                hasSnaped = value >= (headerHeight) && gottenHeaderHeight && gottenTabBarHeight;

            listOffset.current[curRoute] = value;
            onScrollY?.(value);

            if (hasSnaped !== hasSnapTabBar.current)
                onTabBarStickyChange?.(!!hasSnaped);

            hasSnapTabBar.current = hasSnaped;
        });

        headerScrollY.addListener(({ value }) => {
            listRefArr.current.forEach((item) => {
                if (item.key !== routes[tabIndex].key) {
                    return;
                }
                if (value > headerHeight || value < 0) {
                    headerScrollY.stopAnimation();
                    syncScrollOffset();
                }
                if (item.value && value <= headerHeight) {
                    scrollToPosition(item.value, value);
                }
            });
        });

        return () => {
            scrollY.removeAllListeners();
            headerScrollY.removeAllListeners();
        };
    }, [routes, tabIndex, headerHeight, tabBarHeight]);

    const syncScrollOffset = () => {
        const curRouteKey = routes[_tabIndex.current].key;

        listRefArr.current.forEach((item) => {
            if (item.key !== curRouteKey) {
                if (scrollY._value < headerHeight && scrollY._value >= 0) {
                    if (item.value) {
                        scrollToPosition(item.value, scrollY._value);
                        listOffset.current[item.key] = scrollY._value;
                    }
                } else if (scrollY._value >= headerHeight) {
                    if (
                        listOffset.current[item.key] < headerHeight ||
                        listOffset.current[item.key] == null
                    ) {
                        if (item.value) {
                            scrollToPosition(item.value, headerHeight);
                            listOffset.current[item.key] = headerHeight;
                        }
                    }
                }
            }
        });
    };

    const startRefreshAction = () => {

    };

    const handlePanReleaseOrEnd = (evt, gestureState) => {
        syncScrollOffset();
        headerScrollY.setValue(scrollY._value);
        if (Platform.OS === 'ios') {
            if (scrollY._value < 0) {
                if (scrollY._value < -PullToRefreshDist && !refreshStatusRef.current) {
                    startRefreshAction();
                } else {
                    // should bounce back
                    listRefArr.current.forEach((listRef) => {
                        scrollToPosition(listRef.value, 0, true);
                    });
                }
            } else {
                if (Math.abs(gestureState.vy) < 0.2) {
                    return;
                }
                Animated.decay(headerScrollY, {
                    velocity: -gestureState.vy,
                    useNativeDriver: true,
                }).start(() => {
                    syncScrollOffset();
                });
            }
        } else if (Platform.OS === 'android') {
            if (
                headerMoveScrollY._value < 0 &&
                headerMoveScrollY._value / 1.5 < -PullToRefreshDist
            ) {
                startRefreshAction();
            } else {
                Animated.timing(headerMoveScrollY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    const renderScene = ({ route }) => {
        const Data = tabSlides.find(v => v.key === route.key),
            paddingTop = scrollY.interpolate({
                inputRange: [0, headerHeight],
                outputRange: [0, tabBarStickyPosition],
                extrapolateRight: 'clamp',
            });

        return (
            <Data.Wrapper
                {...Data.WrapperProps}
                overScrollMode={enableRefresh ? undefined : 'never'}
                scrollToOverflowEnabled={!!enableRefresh}
                bounces={!!enableRefresh}
                {...listPanResponder.panHandlers}
                ref={(ref) => {
                    if (ref) {
                        const i = listRefArr.current.findIndex((e) => e.key === route.key);
                        if (i === -1) {
                            listRefArr.current.push({
                                key: route.key,
                                value: ref,
                            });
                        } else listRefArr.current[i].value = ref;
                    }
                    Data.WrapperProps?.ref?.(ref);
                }}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: headerHeight + tabBarHeight }}
                renderItem={(props) =>
                    props.index === 0 ?
                        <View>
                            <Animated.View style={{ height: paddingTop }} />
                            {Data.WrapperProps?.renderItem(props)}
                        </View>
                        : Data.WrapperProps?.renderItem(props)
                }
                onScroll={(e) => {
                    if (route.key === routes[tabIndex].key)
                        scrollY.setValue(e.nativeEvent.contentOffset.y);

                    Data.WrapperProps?.onScroll?.(e);
                }}
                onMomentumScrollBegin={() => {
                    isListGliding.current = true;
                }}
                onScrollEndDrag={(e) => {
                    syncScrollOffset();

                    if (
                        Platform.OS === 'ios' &&
                        e.nativeEvent.contentOffset.y < -PullToRefreshDist &&
                        !refreshStatusRef.current
                    )
                        startRefreshAction();
                    Data.WrapperProps?.onScrollEndDrag?.(e);
                }}
                onMomentumScrollEnd={() => {
                    isListGliding.current = false;
                    syncScrollOffset();

                    Data.WrapperProps?.onMomentumScrollEnd?.()
                }}
            />
        )
    }

    const renderLabelText = ({ route, focused }) => (
        <Text style={[styles.label, { opacity: focused ? 1 : 0.5, marginBottom: 9 }]}>
            {route.title}
        </Text>
    )

    const renderTabBarSelector = (props) => {
        const y = scrollY.interpolate({
            inputRange: [0, headerHeight],
            outputRange: [headerHeight, 0 + tabBarStickyPosition],
            // extrapolate: 'clamp',
            extrapolateRight: 'clamp',
        });

        return (
            <Animated.View
                onLayout={e => {
                    setTabBarHeight(e.nativeEvent.layout.height);
                    setGottenTabBarHeight(true);
                }}
                style={{
                    top: 0,
                    zIndex: 1,
                    position: 'absolute',
                    transform: [{ translateY: y }],
                    width: '100%',
                    shadowColor: 'gray',
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 3 }
                }}>
                {renderTabBar ?
                    renderTabBar()
                    : <TabBar
                        {...props}
                        onTabPress={({ route, preventDefault }) => {
                            if (isListGliding.current) preventDefault();
                        }}
                        renderLabel={renderLabel || renderLabelText}
                        {...(renderTabBar ? undefined : {
                            style: styles.tab,
                            indicatorStyle: styles.indicator
                        })}
                    />}
            </Animated.View>
        );
    }

    const renderMainView = () => (
        <TabView
            {...purifyProps()}
            onSwipeStart={() => {
                setCanScroll(false);
                onSwipeStart?.();
            }}
            onSwipeEnd={() => {
                setCanScroll(true);
                onSwipeEnd?.();
            }}
            onIndexChange={i => {
                emittingTabIndex.current = true;
                _tabIndex.current = i;
                setIndex(i);
            }}
            navigationState={{ index: tabIndex, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBarSelector}
            initialLayout={{ height: 0, width: WINDOW_WIDTH }}
        />
    );

    const purifyProps = () => {
        const pure = {};

        Object.keys(props).forEach(k => {
            if (!ExceptionalProps.includes(k)) pure[k] = props[k];
        });

        return pure;
    }

    const renderTopHeader = () => {
        const y = scrollY.interpolate({
            inputRange: [0, headerHeight],
            outputRange: [0, -headerHeight + tabBarStickyPosition],
            extrapolateRight: 'clamp'
        });

        return (
            <Animated.View
                {...headerPanResponder.panHandlers}
                style={{ height: headerHeight, position: 'absolute', width: '100%', transform: [{ translateY: y }] }}>
                <View style={{ position: 'absolute', width: '100%' }}
                    onLayout={e => {
                        setHeight(e.nativeEvent.layout.height);
                        setGottenHeaderHeight(true);
                    }}>
                    {renderHeader?.()}
                </View>
            </Animated.View>
        );
    }

    return (
        <View style={{ flex: 1, opacity: (gottenHeaderHeight && gottenTabBarHeight) ? undefined : 0 }}>
            {renderMainView()}
            {renderTopHeader()}
        </View>
    )
}

const styles = StyleSheet.create({
    label: { fontSize: 15, color: '#222' },
    tab: {
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: 'white',
        height: TabBarHeight
    },
    indicator: { backgroundColor: '#222' },
});

export default CollapsibleTabViewHeader;