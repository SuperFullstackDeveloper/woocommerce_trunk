/**
 * External dependencies
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useInstanceId } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type {
	ProductCollectionAttributes,
	ProductCollectionQuery,
	ProductCollectionEditComponentProps,
} from '../types';
import { DEFAULT_ATTRIBUTES, INNER_BLOCKS_TEMPLATE } from '../constants';
import { getDefaultValueOfInheritQueryFromTemplate } from '../utils';
import InspectorControls from './inspector-controls';
import InspectorAdvancedControls from './inspector-advanced-controls';
import ToolbarControls from './toolbar-controls';

const ProductCollectionContent = (
	props: ProductCollectionEditComponentProps
) => {
	const { clientId, attributes, setAttributes } = props;

	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: INNER_BLOCKS_TEMPLATE,
	} );

	const instanceId = useInstanceId( ProductCollectionContent );
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore These selectors aren't getting their types loaded for some reason.
	const { getBlockParentsByBlockName } = useSelect( blockEditorStore );

	/**
	 * Because of issue https://github.com/WordPress/gutenberg/issues/7342,
	 * We are using this workaround to set default attributes.
	 */
	useEffect(
		() => {
			// In order to properly support pagination this block has a queryId attribute that
			// is initialized to a unique value when the block is first added to the editor.
			// We use the `instanceId` for this purpose. It is stable across saves as long
			// as the order of instances of these blocks in the editor does not change.
			// The block will be re-indexed in that case, however, this won't cause
			// any problems since the queryid only has to be stable across client
			// renders.
			let queryId = instanceId as number;

			// We need to take special care when handling instances in a sync pattern
			// to avoid an infinite loop. When two instances of a pattern are placed
			// on the same page, updating one will cause the other to be re-inserted.
			// If we change the ID on init it will trigger a loop as each competes
			// to set a new queryId and update the sync pattern.
			const blockParents = getBlockParentsByBlockName(
				clientId,
				'core/block'
			);
			if ( blockParents.length > 0 ) {
				queryId = attributes.queryId;
			}

			setAttributes( {
				...DEFAULT_ATTRIBUTES,
				query: {
					...( DEFAULT_ATTRIBUTES.query as ProductCollectionQuery ),
					inherit: getDefaultValueOfInheritQueryFromTemplate(),
				},
				...( attributes as Partial< ProductCollectionAttributes > ),
				queryId,
			} );
		},
		// This hook is only needed on initialization and sets default attributes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	/**
	 * If inherit is not a boolean, then we haven't set default attributes yet.
	 * We don't wanna render anything until default attributes are set.
	 * Default attributes are set in the useEffect above.
	 */
	if ( typeof attributes?.query?.inherit !== 'boolean' ) {
		return null;
	}

	return (
		<div { ...blockProps }>
			<InspectorControls { ...props } />
			<InspectorAdvancedControls { ...props } />
			<ToolbarControls { ...props } />
			<div { ...innerBlocksProps } />
		</div>
	);
};

export default ProductCollectionContent;
