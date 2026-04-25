// USS property definitions, used by completion and hover providers.
// Reference: https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-USS-Properties-Reference.html

export interface UssProperty {
    name: string;
    description: string;
    /** Allowed values shown in completion (where finite). */
    values?: string[];
    /** Whether this is a Unity-specific property (-unity-* prefix). */
    unitySpecific?: boolean;
}

export const USS_PROPERTIES: UssProperty[] = [
    // Layout (flex)
    { name: 'flex', description: 'Shorthand for flex-grow, flex-shrink and flex-basis.' },
    { name: 'flex-direction', description: 'Direction of the main axis of the flex container.', values: ['row', 'row-reverse', 'column', 'column-reverse'] },
    { name: 'flex-wrap', description: 'Whether flex items wrap onto multiple lines.', values: ['nowrap', 'wrap', 'wrap-reverse'] },
    { name: 'flex-basis', description: 'Initial main size of a flex item.' },
    { name: 'flex-grow', description: 'How much a flex item should grow relative to its siblings.' },
    { name: 'flex-shrink', description: 'How much a flex item should shrink relative to its siblings.' },
    { name: 'justify-content', description: 'Distribution of items along the main axis.', values: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] },
    { name: 'align-items', description: 'Alignment of items along the cross axis.', values: ['auto', 'stretch', 'flex-start', 'flex-end', 'center'] },
    { name: 'align-self', description: 'Override align-items for a single item.', values: ['auto', 'stretch', 'flex-start', 'flex-end', 'center'] },
    { name: 'align-content', description: 'Distribution of wrapped lines along the cross axis.', values: ['auto', 'stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'] },

    // Size
    { name: 'width', description: 'Width of the element.' },
    { name: 'height', description: 'Height of the element.' },
    { name: 'min-width', description: 'Minimum width of the element.' },
    { name: 'min-height', description: 'Minimum height of the element.' },
    { name: 'max-width', description: 'Maximum width of the element.' },
    { name: 'max-height', description: 'Maximum height of the element.' },

    // Position
    { name: 'position', description: 'Positioning scheme.', values: ['relative', 'absolute'] },
    { name: 'top', description: 'Distance from the top edge of the containing block.' },
    { name: 'right', description: 'Distance from the right edge of the containing block.' },
    { name: 'bottom', description: 'Distance from the bottom edge of the containing block.' },
    { name: 'left', description: 'Distance from the left edge of the containing block.' },

    // Display
    { name: 'display', description: 'Whether the element is laid out and rendered.', values: ['flex', 'none'] },
    { name: 'visibility', description: 'Whether the element is rendered (still occupies space when hidden).', values: ['visible', 'hidden'] },
    { name: 'opacity', description: 'Opacity of the element from 0.0 to 1.0.' },
    { name: 'overflow', description: 'How content that overflows the box is handled.', values: ['visible', 'hidden', 'scroll'] },
    { name: 'cursor', description: 'Cursor shown when hovering the element.' },

    // Margin / padding
    { name: 'margin', description: 'Shorthand for margin-top, margin-right, margin-bottom, margin-left.' },
    { name: 'margin-top', description: 'Top margin of the element.' },
    { name: 'margin-right', description: 'Right margin of the element.' },
    { name: 'margin-bottom', description: 'Bottom margin of the element.' },
    { name: 'margin-left', description: 'Left margin of the element.' },
    { name: 'padding', description: 'Shorthand for padding-top, padding-right, padding-bottom, padding-left.' },
    { name: 'padding-top', description: 'Top padding of the element.' },
    { name: 'padding-right', description: 'Right padding of the element.' },
    { name: 'padding-bottom', description: 'Bottom padding of the element.' },
    { name: 'padding-left', description: 'Left padding of the element.' },

    // Border
    { name: 'border-width', description: 'Shorthand for all four border widths.' },
    { name: 'border-top-width', description: 'Width of the top border.' },
    { name: 'border-right-width', description: 'Width of the right border.' },
    { name: 'border-bottom-width', description: 'Width of the bottom border.' },
    { name: 'border-left-width', description: 'Width of the left border.' },
    { name: 'border-color', description: 'Shorthand for all four border colors.' },
    { name: 'border-top-color', description: 'Color of the top border.' },
    { name: 'border-right-color', description: 'Color of the right border.' },
    { name: 'border-bottom-color', description: 'Color of the bottom border.' },
    { name: 'border-left-color', description: 'Color of the left border.' },
    { name: 'border-radius', description: 'Shorthand for all four border-radius properties.' },
    { name: 'border-top-left-radius', description: 'Radius of the top-left corner.' },
    { name: 'border-top-right-radius', description: 'Radius of the top-right corner.' },
    { name: 'border-bottom-left-radius', description: 'Radius of the bottom-left corner.' },
    { name: 'border-bottom-right-radius', description: 'Radius of the bottom-right corner.' },

    // Color and background
    { name: 'color', description: 'Foreground (text) color.' },
    { name: 'background-color', description: 'Background fill color.' },
    { name: 'background-image', description: 'Background image. Use url() or resource().' },
    { name: 'background-position', description: 'Position of the background image.' },
    { name: 'background-position-x', description: 'Horizontal position of the background image.' },
    { name: 'background-position-y', description: 'Vertical position of the background image.' },
    { name: 'background-repeat', description: 'Whether and how the background image repeats.', values: ['no-repeat', 'repeat', 'space', 'round'] },
    { name: 'background-size', description: 'Size of the background image.', values: ['auto', 'cover', 'contain'] },

    // Text
    { name: 'font-size', description: 'Size of the font.' },
    { name: 'letter-spacing', description: 'Spacing between characters.' },
    { name: 'word-spacing', description: 'Spacing between words.' },
    { name: 'white-space', description: 'How whitespace is handled.', values: ['normal', 'nowrap'] },
    { name: 'text-overflow', description: 'How text that overflows is rendered.', values: ['clip', 'ellipsis'] },
    { name: 'text-shadow', description: 'Shadow under rendered text.' },

    // Transitions
    { name: 'transition', description: 'Shorthand for the transition properties.' },
    { name: 'transition-property', description: 'Which CSS property animates.' },
    { name: 'transition-duration', description: 'Duration of the transition.' },
    { name: 'transition-timing-function', description: 'Easing curve for the transition.', values: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end'] },
    { name: 'transition-delay', description: 'Delay before the transition starts.' },

    // Transforms
    { name: 'transform-origin', description: 'Origin point for transforms.' },
    { name: 'translate', description: 'Translation of the element.' },
    { name: 'rotate', description: 'Rotation of the element.' },
    { name: 'scale', description: 'Scale of the element.' },

    // Unity-specific
    { name: '-unity-font', description: 'Font asset used to render text.', unitySpecific: true },
    { name: '-unity-font-definition', description: 'Font definition (TextMesh Pro) asset used to render text.', unitySpecific: true },
    { name: '-unity-font-style', description: 'Font style.', values: ['normal', 'italic', 'bold', 'bold-and-italic'], unitySpecific: true },
    { name: '-unity-text-align', description: 'Text alignment.', values: ['upper-left', 'upper-center', 'upper-right', 'middle-left', 'middle-center', 'middle-right', 'lower-left', 'lower-center', 'lower-right'], unitySpecific: true },
    { name: '-unity-text-outline', description: 'Outline shorthand for text.', unitySpecific: true },
    { name: '-unity-text-outline-color', description: 'Color of the text outline.', unitySpecific: true },
    { name: '-unity-text-outline-width', description: 'Width of the text outline.', unitySpecific: true },
    { name: '-unity-paragraph-spacing', description: 'Vertical spacing between paragraphs of text.', unitySpecific: true },
    { name: '-unity-overflow-clip-box', description: 'Where overflow clipping occurs.', values: ['padding-box', 'content-box'], unitySpecific: true },
    { name: '-unity-background-image-tint-color', description: 'Tint applied to the background image.', unitySpecific: true },
    { name: '-unity-background-scale-mode', description: 'How the background image is scaled.', values: ['stretch-to-fill', 'scale-and-crop', 'scale-to-fit'], unitySpecific: true },
    { name: '-unity-slice-top', description: 'Top slice for nine-sliced backgrounds, in pixels.', unitySpecific: true },
    { name: '-unity-slice-right', description: 'Right slice for nine-sliced backgrounds, in pixels.', unitySpecific: true },
    { name: '-unity-slice-bottom', description: 'Bottom slice for nine-sliced backgrounds, in pixels.', unitySpecific: true },
    { name: '-unity-slice-left', description: 'Left slice for nine-sliced backgrounds, in pixels.', unitySpecific: true },
    { name: '-unity-slice-scale', description: 'Scale applied to nine-slice borders.', unitySpecific: true },
];

/** Lookup table by property name. */
export const PROPERTY_BY_NAME: Map<string, UssProperty> = new Map(
    USS_PROPERTIES.map(p => [p.name, p]),
);
