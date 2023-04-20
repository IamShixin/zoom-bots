import { useDropzone } from "react-dropzone";
import { useEffect, useMemo } from "react";
interface Props {
  className?: string,
  onSuccess?: (files: File[]) => void
}
export const Upload:React.FC<Props> = ({ onSuccess, className }) => {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles
  } = useDropzone();
  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 2,
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
    borderColor: "#2196f3"
  };

  const focusedStyle = {
    borderColor: "#2196f3"
  };

  const acceptStyle = {
    borderColor: "#00e676"
  };

  const rejectStyle = {
    borderColor: "#ff1744"
  };
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);
  useEffect(() => {
    acceptedFiles.length > 0 && onSuccess?.(acceptedFiles);
  }, [acceptedFiles, onSuccess]);
  const files = acceptedFiles.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  return (
    <div className={"container" + className}>
      <div {...getRootProps({ style } as any)}>
        <input {...getInputProps()} />
        <p> Click to select and upload files(.properties) </p>
      </div>
      <ul className="text-center mt-1">{files}</ul>
    </div>
  );
};