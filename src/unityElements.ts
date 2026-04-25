// Unity UI Toolkit element definitions, used by completion and hover providers.
// Reference: https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-VisualElements.html

export interface UnityElement {
    name: string;
    namespace: 'UnityEngine.UIElements' | 'UnityEditor.UIElements';
    description: string;
    bindable: boolean;
    /** Attributes specific to this element (in addition to those inherited from VisualElement). */
    attributes: UnityAttribute[];
}

export interface UnityAttribute {
    name: string;
    type: string;
    description: string;
    /** Optional list of allowed values for enum-like attributes. */
    values?: string[];
}

/** Attributes that every VisualElement (and therefore every UI element) supports. */
export const VISUAL_ELEMENT_ATTRIBUTES: UnityAttribute[] = [
    { name: 'name', type: 'string', description: 'A unique identifier for the element.' },
    { name: 'class', type: 'string', description: 'A space-separated list of USS classes applied to the element.' },
    { name: 'style', type: 'string', description: 'Inline USS-style declarations.' },
    { name: 'tooltip', type: 'string', description: 'Tooltip text shown on hover.' },
    { name: 'tabindex', type: 'int', description: 'Defines the tabbing order. Negative values are not focusable.' },
    { name: 'focusable', type: 'bool', description: 'Whether the element can receive focus.', values: ['true', 'false'] },
    { name: 'picking-mode', type: 'enum', description: 'Whether the element responds to mouse events.', values: ['Position', 'Ignore'] },
    { name: 'view-data-key', type: 'string', description: 'Key used to serialize element state across editor sessions.' },
    { name: 'binding-path', type: 'string', description: 'Path to a serialized property to bind to.' },
];

export const UNITY_ELEMENTS: UnityElement[] = [
    {
        name: 'UXML',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'Document root element for a UXML file.',
        attributes: [
            { name: 'xmlns:engine', type: 'string', description: 'Namespace prefix for UnityEngine.UIElements.' },
            { name: 'xmlns:editor', type: 'string', description: 'Namespace prefix for UnityEditor.UIElements.' },
            { name: 'xmlns:xsi', type: 'string', description: 'XML Schema Instance namespace.' },
            { name: 'xsi:noNamespaceSchemaLocation', type: 'string', description: 'Location of the UXML schema definition file.' },
        ],
    },
    {
        name: 'VisualElement',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'The base class for all UI elements. A generic container with no visual representation.',
        attributes: [],
    },
    {
        name: 'BindableElement',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A VisualElement that can be bound to a serialized property.',
        attributes: [],
    },
    {
        name: 'Box',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'A simple bordered container element.',
        attributes: [],
    },
    {
        name: 'Button',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A clickable button.',
        attributes: [
            { name: 'text', type: 'string', description: 'The text shown on the button.' },
        ],
    },
    {
        name: 'Toggle',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A boolean toggle (checkbox).',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the toggle.' },
            { name: 'text', type: 'string', description: 'Text shown beside the checkbox.' },
            { name: 'value', type: 'bool', description: 'Initial value of the toggle.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'Label',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A non-interactive text label.',
        attributes: [
            { name: 'text', type: 'string', description: 'The text content of the label.' },
            { name: 'enable-rich-text', type: 'bool', description: 'Whether rich-text tags are parsed.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'TextField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A single-line or multi-line editable text field.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'string', description: 'Initial text value.' },
            { name: 'multiline', type: 'bool', description: 'Whether the field accepts multiple lines.', values: ['true', 'false'] },
            { name: 'password', type: 'bool', description: 'Whether the field obscures input.', values: ['true', 'false'] },
            { name: 'max-length', type: 'int', description: 'Maximum number of characters allowed.' },
            { name: 'mask-character', type: 'string', description: 'Character used to mask password input.' },
        ],
    },
    {
        name: 'IntegerField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that accepts integer values.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'int', description: 'Initial value.' },
        ],
    },
    {
        name: 'FloatField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that accepts single-precision floating-point values.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'float', description: 'Initial value.' },
        ],
    },
    {
        name: 'DoubleField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that accepts double-precision floating-point values.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'double', description: 'Initial value.' },
        ],
    },
    {
        name: 'LongField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that accepts 64-bit integer values.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'long', description: 'Initial value.' },
        ],
    },
    {
        name: 'Slider',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A floating-point slider between two bounds.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the slider.' },
            { name: 'low-value', type: 'float', description: 'Minimum value.' },
            { name: 'high-value', type: 'float', description: 'Maximum value.' },
            { name: 'value', type: 'float', description: 'Initial value.' },
            { name: 'direction', type: 'enum', description: 'Slider orientation.', values: ['Horizontal', 'Vertical'] },
            { name: 'show-input-field', type: 'bool', description: 'Whether to show a numeric input next to the slider.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'SliderInt',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'An integer slider between two bounds.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the slider.' },
            { name: 'low-value', type: 'int', description: 'Minimum value.' },
            { name: 'high-value', type: 'int', description: 'Maximum value.' },
            { name: 'value', type: 'int', description: 'Initial value.' },
        ],
    },
    {
        name: 'Foldout',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A collapsible section with a header.',
        attributes: [
            { name: 'text', type: 'string', description: 'The header text of the foldout.' },
            { name: 'value', type: 'bool', description: 'Whether the foldout is expanded.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'GroupBox',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A container that groups related controls and gives radio buttons mutual exclusion.',
        attributes: [
            { name: 'text', type: 'string', description: 'Optional title shown above the group.' },
        ],
    },
    {
        name: 'HelpBox',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'A box that displays a message with an icon (info, warning or error).',
        attributes: [
            { name: 'text', type: 'string', description: 'The message text.' },
            { name: 'message-type', type: 'enum', description: 'The type of help icon.', values: ['None', 'Info', 'Warning', 'Error'] },
        ],
    },
    {
        name: 'Image',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'Displays a texture or sprite.',
        attributes: [
            { name: 'image', type: 'string', description: 'Path to the texture asset.' },
            { name: 'sprite', type: 'string', description: 'Path to the sprite asset.' },
            { name: 'scale-mode', type: 'enum', description: 'How the image is scaled.', values: ['StretchToFill', 'ScaleAndCrop', 'ScaleToFit'] },
            { name: 'tint-color', type: 'Color', description: 'Tint applied to the image.' },
        ],
    },
    {
        name: 'ScrollView',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'A scrollable container for long content.',
        attributes: [
            { name: 'mode', type: 'enum', description: 'Scroll mode.', values: ['Vertical', 'Horizontal', 'VerticalAndHorizontal'] },
            { name: 'horizontal-scroller-visibility', type: 'enum', description: 'Visibility of the horizontal scroller.', values: ['Auto', 'AlwaysVisible', 'Hidden'] },
            { name: 'vertical-scroller-visibility', type: 'enum', description: 'Visibility of the vertical scroller.', values: ['Auto', 'AlwaysVisible', 'Hidden'] },
        ],
    },
    {
        name: 'ListView',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A scrollable list of identical items.',
        attributes: [
            { name: 'fixed-item-height', type: 'float', description: 'Fixed height of each item in pixels.' },
            { name: 'show-border', type: 'bool', description: 'Whether to show a border around the list.', values: ['true', 'false'] },
            { name: 'show-add-remove-footer', type: 'bool', description: 'Whether to show add/remove buttons at the bottom.', values: ['true', 'false'] },
            { name: 'reorderable', type: 'bool', description: 'Whether items can be reordered by dragging.', values: ['true', 'false'] },
            { name: 'selection-type', type: 'enum', description: 'How items can be selected.', values: ['None', 'Single', 'Multiple'] },
        ],
    },
    {
        name: 'TreeView',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A hierarchical tree of items.',
        attributes: [
            { name: 'fixed-item-height', type: 'float', description: 'Fixed height of each item in pixels.' },
            { name: 'show-border', type: 'bool', description: 'Whether to show a border around the tree.', values: ['true', 'false'] },
            { name: 'selection-type', type: 'enum', description: 'How items can be selected.', values: ['None', 'Single', 'Multiple'] },
        ],
    },
    {
        name: 'RadioButton',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A radio button. Use inside a RadioButtonGroup or GroupBox for mutual exclusion.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the radio button.' },
            { name: 'text', type: 'string', description: 'Text shown next to the radio button.' },
            { name: 'value', type: 'bool', description: 'Whether the button is selected.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'RadioButtonGroup',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A container that ensures at most one of its RadioButtons is selected.',
        attributes: [
            { name: 'label', type: 'string', description: 'Group label.' },
            { name: 'choices', type: 'string', description: 'Comma-separated list of choices.' },
            { name: 'value', type: 'int', description: 'Index of the selected choice.' },
        ],
    },
    {
        name: 'ProgressBar',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A bar that visually represents progress.',
        attributes: [
            { name: 'low-value', type: 'float', description: 'Minimum value.' },
            { name: 'high-value', type: 'float', description: 'Maximum value.' },
            { name: 'value', type: 'float', description: 'Current value.' },
            { name: 'title', type: 'string', description: 'Title shown over the bar.' },
        ],
    },
    {
        name: 'DropdownField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A dropdown menu of string choices.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the dropdown.' },
            { name: 'choices', type: 'string', description: 'Comma-separated list of choices.' },
            { name: 'value', type: 'string', description: 'Initial selected value.' },
            { name: 'index', type: 'int', description: 'Initial selected index.' },
        ],
    },
    {
        name: 'EnumField',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A dropdown that selects an enum value.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the dropdown.' },
            { name: 'type', type: 'string', description: 'Fully qualified name of the enum type.' },
            { name: 'value', type: 'string', description: 'Initial enum value.' },
        ],
    },
    {
        name: 'Vector2Field',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that edits a Vector2.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'string', description: 'Initial value (x,y).' },
        ],
    },
    {
        name: 'Vector3Field',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that edits a Vector3.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'string', description: 'Initial value (x,y,z).' },
        ],
    },
    {
        name: 'Vector4Field',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A field that edits a Vector4.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'value', type: 'string', description: 'Initial value (x,y,z,w).' },
        ],
    },
    {
        name: 'MinMaxSlider',
        namespace: 'UnityEngine.UIElements',
        bindable: true,
        description: 'A slider with two thumbs that selects a range.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the slider.' },
            { name: 'min-value', type: 'float', description: 'Lower thumb value.' },
            { name: 'max-value', type: 'float', description: 'Upper thumb value.' },
            { name: 'low-limit', type: 'float', description: 'Minimum allowed value.' },
            { name: 'high-limit', type: 'float', description: 'Maximum allowed value.' },
        ],
    },
    {
        name: 'Template',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'A reference to another UXML template that can be instantiated using the Instance element.',
        attributes: [
            { name: 'name', type: 'string', description: 'A unique name to refer to this template.' },
            { name: 'src', type: 'string', description: 'The path of the UXML file to load.' },
            { name: 'path', type: 'string', description: 'Resources-folder path of the UXML file (legacy).' },
        ],
    },
    {
        name: 'Instance',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'Instantiate a previously defined Template.',
        attributes: [
            { name: 'template', type: 'string', description: 'The name of the Template to instantiate.' },
        ],
    },
    {
        name: 'AttributeOverrides',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'Override attributes on an element inside a template Instance.',
        attributes: [
            { name: 'element-name', type: 'string', description: 'The name of the element to override.' },
        ],
    },
    {
        name: 'Style',
        namespace: 'UnityEngine.UIElements',
        bindable: false,
        description: 'Reference an external USS stylesheet.',
        attributes: [
            { name: 'src', type: 'string', description: 'Path of the USS file (relative or absolute).' },
            { name: 'path', type: 'string', description: 'Resources-folder path of the USS file (legacy).' },
        ],
    },
    // Editor-only controls (UnityEditor.UIElements)
    {
        name: 'ColorField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that edits a UnityEngine.Color value.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'show-alpha', type: 'bool', description: 'Whether the alpha channel is editable.', values: ['true', 'false'] },
            { name: 'hdr', type: 'bool', description: 'Whether the field accepts HDR colors.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'ObjectField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that picks a UnityEngine.Object reference.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'type', type: 'string', description: 'Fully qualified name of the accepted Object type.' },
            { name: 'allow-scene-objects', type: 'bool', description: 'Whether scene objects are allowed.', values: ['true', 'false'] },
        ],
    },
    {
        name: 'CurveField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that edits an AnimationCurve.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
        ],
    },
    {
        name: 'GradientField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that edits a Gradient.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
        ],
    },
    {
        name: 'PropertyField',
        namespace: 'UnityEditor.UIElements',
        bindable: false,
        description: 'An editor-only element that draws a SerializedProperty using its default inspector.',
        attributes: [
            { name: 'label', type: 'string', description: 'Override the default label.' },
            { name: 'binding-path', type: 'string', description: 'Path to the SerializedProperty.' },
        ],
    },
    {
        name: 'EnumFlagsField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only enum-flags dropdown.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
            { name: 'type', type: 'string', description: 'Fully qualified enum type.' },
        ],
    },
    {
        name: 'LayerField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that picks a Unity layer.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
        ],
    },
    {
        name: 'LayerMaskField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that edits a LayerMask.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
        ],
    },
    {
        name: 'TagField',
        namespace: 'UnityEditor.UIElements',
        bindable: true,
        description: 'An editor-only field that picks a Unity tag.',
        attributes: [
            { name: 'label', type: 'string', description: 'Label shown next to the field.' },
        ],
    },
    {
        name: 'Toolbar',
        namespace: 'UnityEditor.UIElements',
        bindable: false,
        description: 'An editor-only toolbar container.',
        attributes: [],
    },
    {
        name: 'ToolbarButton',
        namespace: 'UnityEditor.UIElements',
        bindable: false,
        description: 'An editor-only button styled for use in a toolbar.',
        attributes: [
            { name: 'text', type: 'string', description: 'Button text.' },
        ],
    },
    {
        name: 'ToolbarSearchField',
        namespace: 'UnityEditor.UIElements',
        bindable: false,
        description: 'An editor-only search field styled for use in a toolbar.',
        attributes: [],
    },
];

/** Lookup table by element name (without namespace prefix). */
export const ELEMENT_BY_NAME: Map<string, UnityElement> = new Map(
    UNITY_ELEMENTS.map(e => [e.name, e]),
);
