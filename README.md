# react-native-tab-view-header
A tabview component with collapsible header. adapted with refreshable, scrollable and touchable header 

[![npm version](https://badge.fury.io/js/react-native-tab-view-header.svg)](https://www.npmjs.com/package/react-native-tab-view-header)

### Getting Started

#### Install

react-native-tab-view-header is built upon [react-native-tab-view](https://github.com/satya164/react-native-tab-view)

```
npm install react-native-tab-view-header react-native-tab-view --save
```

or using yarn

```
yarn add react-native-tab-view-header react-native-tab-view
```

### Demo

<img src="https://github.com/deflexable/react-native-tab-view-header/picture/demo.gif" width="360>


### Example

```js
import React, { useState } from "react";
import { Alert, Animated, TouchableOpacity, View, Text, FlatList } from "react-native";
import { getStatusBarHeight } from "react-native-iphone-x-helper";
import { WINDOW_HEIGHT } from "../../values/GeneralValues";
import CollapsibleTabViewHeader from "react-native-tab-view-header";


const App = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const slideData = [{
        key: 'first',
        title: 'First',
        Wrapper: Animated.FlatList,
        WrapperProps: {
            data: Array(20).fill(1),
            renderItem: ({ item, index }) => (
                <View style={{ backgroundColor: index % 2 ? 'lightgray' : 'gray', height: WINDOW_HEIGHT / 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>
                        {`Index: ${index}`}
                    </Text>
                </View>
            ),
            keyExtractor: (_item, index) => index
        }
    }, {
        key: 'second',
        title: 'Second',
        Wrapper: Animated.FlatList,
        WrapperProps: {
            data: Array(40).fill(1),
            renderItem: ({ item, index }) => (
                <View style={{ backgroundColor: index % 2 ? 'orange' : 'pink', height: WINDOW_HEIGHT / 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>
                        {`Index: ${index}`}
                    </Text>
                </View>
            ),
            keyExtractor: (_item, index) => index
        }
    }]

    const renderHeaderScroll = () => (
        <FlatList
            style={{ width: '100%', height: 50 }}
            data={Array(40).fill(1)}
            renderItem={({ item, index }) =>
                <Text style={{ backgroundColor: 'orange', width: 50, height: 50, textAlign: 'center' }}>
                    {index + ''}
                </Text>
            }
            keyExtractor={(_, i) => i}
            horizontal
        />
    )

    return (
        <View style={{ flex: 1 }}>
            <CollapsibleTabViewHeader
                tabSlides={slideData}
                tabIndex={currentSlideIndex} // if you want to control the current tab index
                onIndexChange={i => {
                    console.log('onIndexChange: ', i);
                    setCurrentSlideIndex(i);
                }}
                renderTabBar={undefined} // only provide this if you want to render your custom tab bar
                renderHeader={() =>
                    <View style={{ height: 350, backgroundColor: 'red' }}>
                        <TouchableOpacity
                            style={{ height: 270, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                Alert.alert('Header Clicked');
                            }}>
                            <Text>
                                {'Click Header'}
                            </Text>
                        </TouchableOpacity>
                        {renderHeaderScroll()}
                    </View>
                }
                enableRefresh={false} // enable refresh control
                tabBarStickyPosition={getStatusBarHeight()} // position to stop the header and tab-bar
                onTabBarStickyChange={sticky => null} // callback that triggers whenever the tab-bar stick/unstick
            />
        </View>
    )
}

export default App;
```

### PropTypes

| Property                | Type        | Description                                                                                             |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| tabSlides               | `Array`     | Array containing data pertaining to each tab slide                                                      |
| onIndexChange           | `Function`  | Called whenever the current tab index changes                                                           |
| renderTabBar            | `Function`  | Function that renders your custom tab-bar component                                                     |
| renderHeader            | `Function`  | Function that renders your custom header component                                                      |
| tabIndex                | `number`    | The default visible slide index of the tab view                                                         |
| headerHeight            | `number`    | The height of the header (Optional but speedup tabview render when provide together with tabBarHeight)  |
| onScrollY               | `Function`  | Listens to the scroll offset of the tabview                                                             |
| tabBarStickyPosition    | `number`    | The position in which the tab-bar should stop                                                           |
| onTabBarStickyChange    | `Function`  | Called whenever the tab-bar stick/unstick to it position                                                |
| onHeaderHeightChanged   | `Function`  | Called whenever the header height changes                                                               |
| renderLabel             | `Function`  | Function that renders the tab-bar label instead of the entire tab-bar                                   |


### TODOS

- Add refresh control feature
- Add support for ```js <View />``` and ```js <ScrollView />``` (Currently only support FlatList, SectionList)


### Reference

- [react-native-tab-view](https://github.com/satya164/react-native-tab-view)
- [@junghsuan collapsible-tabview](https://github.com/JungHsuan/react-native-collapsible-tabview)


##### Contribution

Pull requests and contributions are welcome
