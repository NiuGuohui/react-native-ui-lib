import isUndefined from 'lodash/isUndefined';
import get from 'lodash/get';
import React, {useMemo} from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';
import {asBaseComponent, BaseComponentInjectedProps, MarginModifiers, Constants} from '../../commons/new';
import Assets from '../../assets';

export type IconProps = ImageProps &
  MarginModifiers & {
    /**
     * if provided icon source will be driven from asset name
     */
    assetName?: string;
    /**
     * the asset group, default is "icons"
     */
    assetGroup?: string;
    /**
     * the icon tint
     */
    tintColor?: string;
    /**
     * the icon size
     */
    size?: number;
    /**
     * whether the icon should flip horizontally on RTL
     */
    supportRTL?: boolean;
  };

/**
 * @description: Icon component
 * @extends: Image
 * @extendsLink: https://reactnative.dev/docs/image
 */

type Props = IconProps & BaseComponentInjectedProps;

const Icon = (props: Props) => {
  const {size, tintColor, style, supportRTL, source, assetGroup, assetName, modifiers, ...others} = props;
  const {margins} = modifiers;
  const iconSize = size ? {width: size, height: size} : undefined;
  const shouldFlipRTL = supportRTL && Constants.isRTL;

  const iconSource = useMemo(() => {
    if (!isUndefined(assetName)) {
      return get(Assets, `${assetGroup}.${assetName}`);
    }
    return source;
  }, [source, assetGroup, assetName]);

  return (
    <Image
      {...others}
      source={iconSource}
      style={[style, margins, iconSize, shouldFlipRTL && styles.rtlFlipped, !!tintColor && {tintColor}]}
    />
  );
};

Icon.displayName = 'Icon';
Icon.defaultProps = {
  assetGroup: 'icons'
};
export default asBaseComponent<IconProps, typeof Icon>(Icon);

const styles = StyleSheet.create({
  rtlFlipped: {
    transform: [{scaleX: -1}]
  }
});
