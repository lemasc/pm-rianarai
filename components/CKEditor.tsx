import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@lemasc/ckeditor-markdown'

type EditorProps = {
  data: string
  minified?: boolean
  [key: string]: any
}

const minConfig = {
  removePlugins: ['heading', 'image'],
  toolbar: ['bold', 'italic', 'underline', 'bulletedList', 'numberedList'],
  language: 'th',
}
const config = {
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'outdent',
    'indent',
    '|',
    'imageUpload',
    'insertTable',
    'undo',
    'redo',
  ],
  language: 'th',
  /* image: {
    toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },*/
}
export default function Editor({ minified, ...props }: EditorProps): JSX.Element {
  return <CKEditor config={minified ? minConfig : config} editor={ClassicEditor} {...props} />
}
